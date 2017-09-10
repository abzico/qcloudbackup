# qcloudbackup

Automated cyclic-backup script for CVM as snapshots for specified storageId on QCloud implemented in NodeJS.

# What It Can Do

Script will check first if creating a snapshot for specified `storageId` will require a deletion of existing snapshot or not. QCloud limits number of snapshots to be `number of harddisk` * 7. Then it will create a snapshot.

It will delay for specified amount of time before attempting to create a snapshot. This is due to consecutive creation of snapshot might be affected by previous un-complete operation even on different storage.

# How To

1. Install and configure `qcloudcli` properly. See [installation of qcloudcli](https://www.qcloud.com/document/product/440/6181), and how to [configure](https://www.qcloud.com/document/product/440/6184).

2. (optional) Modify parameters in `index.js` file.

	* `storageIds` -> define storageId to apply for backup
	* `kMaxSnapshots` -> define number of snapshots to be hold before deletion oldest one if a new snapshot needs to be created
	* `kWaitBeforeCreation` -> time wait in millisecond just before CreateSnapshot operation will be cariied out, just for safety for consecutive snapshot creation
 
3. Execute `node index.js`
4. (optional) Recommend to automate it with cron job.

# License

[MIT](https://github.com/haxpor/qcloudbackup/blob/master/LICENSE), Wasin Thonkaew