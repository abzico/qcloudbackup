/**
 * Author: haxpor
 * Link: https://github.com/haxpor/qcloudbackup
 * It can be used as it is, otherwise see README.md on github.
 */

'use strict';

require('./promise-retry.js');
var exec = require('child_process').exec;
const wechatNotify = require('wechat-notifier');

// define storageIds we're interested in
var storageIds = ['disk-9346zr34', 'disk-8ep6r2v8'];
// define max snapshot for storageId (default is 7 as defined by QCloud)
// note: should not define more than 7
const kMaxSnapshots = 7;
const kWaitBeforeCreation = 10000;	// in ms

// get the current list of snapshots from qcloud cli
console.log('Request for list of snapshots...');
executeCmd('qcloudcli snapshot DescribeSnapshots')
	.then((res) => {
		try {
			// convert into json object to feed to functions later
			var resultObj = JSON.parse(res);

			// begin main program
			mainWorker(resultObj, worker)
				.then(() => {
					console.log("all done!");

					// notify via WeChat
					wechatNotify.notifySuccessMessage()
						.then((res) => {
							console.log('Succesfully notified via WeChat message');
						})
						.catch((err) => {
							console.log('Can\'t notify success message via WeChat: ' + err.message);
						});
				})
				.catch((err) => {
					console.log('Error: ', err);

					// notify via WeChat
					wechatNotify.notifyFailMessage(err.message)
						.then((res) => {
							console.log('Succesfully notified error message via WeChat message');
						})
						.catch((err) => {
							console.log('Can\'t notify error message via WeChat: ' + err.message);
						});
				});
		}
		catch(e) {
			console.log(e);
		}
	})
	.catch((err) => {
		console.log(err);
	});

// worker function to operate on storageId
// Return Promise object
var worker = function(resultObj, storageId) {
	return new Promise((resolve, reject) => {
		// get count of snapshots
		var count = countSnapshots(resultObj, storageId);

		console.log(`--- Operating for storageId:${storageId} ---`);

		// if exceed we need to remove the oldest snapshot
		if (count >= kMaxSnapshots) {
			var oldestSnapshotId = getOldestSnapshotId(resultObj, storageId);
			console.log(`Deleting oldest snapshotId (${oldestSnapshotId})...`);
			executeCmd(`qcloudcli snapshot DeleteSnapshot --snapshotIds '["${oldestSnapshotId}"]'`)
				.then(() => {
					console.log(`Wait for ${kWaitBeforeCreation}ms before creating a new snapshot...`);
					return Promise.wait(kWaitBeforeCreation);
				})
				.then(() => {
					return createSnapshot(storageId);
				})
				.then((res) => {
					resolve(res);
				})
				.catch((err) => {
					console.log('error: ', err);
					reject(err);
				});
		}
		// otherwise we're free to create a new one
		else {
			// wait for a little bit
			// previous creation operation might has affect on this one
			console.log(`Wait for ${kWaitBeforeCreation}ms before creating a new snapshot...`);
			Promise.wait(kWaitBeforeCreation)
				.then(() => {
					return createSnapshot(storageId);
				})
				.then((res) => {
					resolve(res);
				})
				.catch((err) => {
					console.log('error: ', err);
					reject(err);
				});
		}
	});
};

// main worker
var mainWorker = function(snapshotsResultObj, fn) {
	var index = 0;

	return new Promise((resolve, reject) => {

		function next() {
			if (index < storageIds.length) {
				fn(snapshotsResultObj, storageIds[index++])
					.then(() => {
						next();
					}, (err) => {
						reject(err);
					});
			}
			else {
				resolve();
			}
		}
		
		next();
	});
};

// execute command
// Return Promise object
function executeCmd(cmd) {
	return new Promise((resolve, reject) => {
		exec(cmd, (error, stdout, stderr) => {

			try {
				var jsonResult = stdout != null ? JSON.parse(stdout) : null;

				// if there's any error, and "code" is not 0 (which is success)
				// then reject it
				if (error || stderr || (jsonResult.code != 0)) {
					// error message might not be in error, or stdout object
					if (error)
						reject(error);
					else if (stderr)
						reject(stderr);
					else
						reject(stdout);
				}
				else {
					resolve(stdout);
				}
			}
			catch(e) {
				reject(e);
			}
		}); 
	});
}

// Count snapshots from specified storageId
// Return number of snapshots count
function countSnapshots(qcloudJsonResult, qcloudstorageId) {
	var snapshots = qcloudJsonResult.snapshotSet;
	var count = 0;

	for (var i=0; i<snapshots.length; i++) {
		if (snapshots[i].storageId === qcloudstorageId) {
			count++;
		}
	}

	return count;
}

// Get the oldest snapshotId for specified storageId
// Return oldest snapshotId of specified storageId type
function getOldestSnapshotId(qcloudJsonResult, qcloudStorageId) {
	var snapshots = qcloudJsonResult.snapshotSet;

	// find the first match of the snapshot according to storage Id then return it
	// as array is already sorted in ascending order
	for (var i=0; i<snapshots.length; i++) {
		// if match, then add into matched array
		if (snapshots[i].storageId == qcloudStorageId) {
			return snapshots[i].snapshotId;
		}
	}
}

// Creae a new snapshot for storageId
// Return Promise object
function createSnapshot(storageId) {
	return new Promise((resolve, reject) => {
		executeCmd(`qcloudcli snapshot CreateSnapshot --storageId ${storageId}`)
			.then((res) => {
				try {
					var jsonObj = JSON.parse(res);
					console.log(`Done creating a snapshot (snapshotId:${jsonObj.snapshotId})`, jsonObj);
					resolve(jsonObj);
				}
				catch(e) {
					reject(e);
				}
			})
			.catch((err) => {
				reject(err);
			});
	});
}