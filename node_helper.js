"use strict";
const NodeHelper = require("node_helper");
const { spawn, exec } = require("child_process");
const { PythonShell } = require("python-shell");

module.exports = NodeHelper.create({
	gstStream: null,

	startStream: function (shmPath) {
		const gstString =
			"gst-launch-1.0 shmsrc socket-path=/dev/shm/camera_image ! video/x-raw,framerate=30/1,width=1280,height=720,format=BGR ! jpegenc ! image/jpeg,framerate=30/1,width=1280,height=720 ! shmsink socket-path=/dev/shm/center_display sync=false wait-for-connection=false shm-size=100000000";
		this.gstStream = spawn(gstString, [this.path, this.config.image_width, this.config.image_height]);
	},

	startHttpStream: function () {
		const self = this;
		console.log("[" + self.name + "] starting http stream");

		self.pyshell = new PythonShell(this.path + "/python-scripts/webstream.py", {
			pythonPath: "python3",
			args: [JSON.stringify(this.config.image_width), JSON.stringify(this.config.image_height)],
		});

		self.pyshell.on("message", function (message) {
			try {
				var parsed_message = JSON.parse(message);
				// console.log("[MSG " + self.name + "] " + parsed_message);
				if (parsed_message.hasOwnProperty("status")) {
					// console.log("[" + self.name + "] " + JSON.stringify(parsed_message.status));
				}
				if (parsed_message.hasOwnProperty("error")) {
					// console.log("ERROR! [" + self.name + "] " + parsed_message.error);
				}
				if (parsed_message.hasOwnProperty("STREAM")) {
					self.sendSocketNotification("STREAM", parsed_message.STREAM);
				}
			} catch (err) {
				// console.log("[" + self.name + "] a non json message received");
				console.log("[" + self.name + "] message received: " + message);
				// console.log(err);
			}
		});
	},

	socketNotificationReceived: function (notification, payload) {
		try {
			const self = this;
			if (notification === "CONFIG") {
				this.config = payload;
				console.log("[" + self.name + "] Starting with config: " + this.config);

				// this.startStream("");
				this.startHttpStream();
			} else if (notification === "LABEL_DISPLAY") {
				var data = { SET: payload };
				if (pythonStarted) self.pyshell.send(JSON.stringify(data));
			}
		} catch (err) {
			console.error(err);
		}
	},

	stop: function () {
		const self = this;
		self.pyshell.childProcess.kill("SIGINT");
		self.pyshell.end(function (err) {
			if (err) {
				// throw err;
			}
			console.log("finished");
		});
		self.pyshell.childProcess.kill("SIGKILL");

		if (!this.gstStream.kill("SIGINT")) {
			this.gstStream.kill("SIGKILL");
		}
	},
});
