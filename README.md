<a href="https://github.com/abzico/donate"><img src="https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&amp;style=flat" alt="donate"></a>

# qcloudbackup

Automated cyclic-backup script for CVM as snapshots for specified storageId on QCloud implemented in NodeJS.

# What It Can Do

Script will check first if creating a snapshot for specified `storageId` will require a deletion of existing snapshot or not. QCloud limits number of snapshots to be `number of harddisk` * 7. Then it will create a snapshot.

It will delay for specified amount of time before attempting to create a snapshot. This is due to consecutive creation of snapshot might be affected by previous un-complete operation even on different storage.

# How To

## Notifying of Backing up Result (optional)

To be able to notify successful, or failed message to your WeChat account via your WeChat Official/Subscription account with granted permission to send templated message. Then defines all of the following settings.

* `WECHAT_APPID=<your app id>`

	Check at [mp.weixin.qq.com](https://mp.weixin.qq.com) for your WeChat official / subscription account.

* `WECHAT_APPSECRET=<your app secret>`

	Check at [mp.weixin.qq.com](https://mp.weixin.qq.com) for your WeChat official / subscription account.

* `WECHAT_SU_OPENID=<user open id to receive msgs>`

	You can find out what is your open id attached to your WeChat official / subscription account you followed by listing followers list via [Follow List API](http://open.wechat.com/cgi-bin/newreadtemplate?t=overseas_open/docs/oa/user/follower-list#user_follower-list).

* `WECHAT_SUCCESS_TEMPLATE_ID=<your template id>`

	Check at [mp.weixin.qq.com](https://mp.weixin.qq.com) for Template Message section (you might need to apply to grant this ability). Then add a template that has at least 2 **keywords**, with 1 **remark**.

* `WECHAT_FAIL_TEMPLATE_ID=<your template id>`

	Check at [mp.weixin.qq.com](https://mp.weixin.qq.com) for Template Message section (you might need to apply to grant this ability). Then add a template that has at least 4 **keywords**, with 1 **remark**.

You need to set all of above environment variables in order to make it works.

## Run the Program

1. Install and configure `qcloudcli` properly. See [installation of qcloudcli](https://www.qcloud.com/document/product/440/6181), and how to [configure](https://www.qcloud.com/document/product/440/6184).

2. Modify parameters in `index.js` file.

	* `storageIds` -> define storageId to apply for backup. You need to define what's yours here.

		You can loook for `storageIds` easily on QCloud's dashboard in _Cloud Virtual Machine_ and _Cloud Block Storage_. Or via API which needs slightly effort.

		To get `storageIds` values from API. Execute `qcloudcli cbs DescribeCbsStorages` then look at field `storageId` for each item. Select ones you want then put it into `index.js` file.
	* (optional) `kMaxSnapshots` -> define number of snapshots to be hold before deletion oldest one if a new snapshot needs to be created
	* (optional) `kWaitBeforeCreation` -> time wait in millisecond just before CreateSnapshot operation will be cariied out, just for safety for consecutive snapshot creation

3. Execute `npm install` to install all dependencies.
4. Execute `node index.js` to run the program thus begin backing up process.
5. (optional) Recommend to automate it with cron job.

# License

[MIT](https://github.com/haxpor/qcloudbackup/blob/master/LICENSE), Wasin Thonkaew
