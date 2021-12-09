from flask import Flask, render_template, Response
from threading import Thread
import os, sys
import cv2
import json
import numpy as np

IMAGE_WIDTH = 1920
IMAGE_HEIGHT = 1080
show_camera = True
show_camera_1m = False
show_style_transfer = False
rescale_image = False

try:
	IMAGE_WIDTH = int(sys.argv[1])
	IMAGE_HEIGHT = int(sys.argv[2])
except:
	print("using default image size")


def to_node(type, message):
	# convert to json and print (node helper will read from stdout)
	try:
		print(json.dumps({type: message}))
	except Exception:
		pass
	# stdout has to be flushed manually to prevent delays in the node helper communication
	sys.stdout.flush()


class VideoCamera(object):
	def __init__(self):
		self.camera_image = cv2.VideoCapture()
		if os.path.exists("/dev/shm/camera_image"):
			self.open_stream(self.camera_image, "/dev/shm/camera_image")
		self.camera_1m = cv2.VideoCapture()
		if os.path.exists("/dev/shm/camera_1m"):
			self.open_stream(self.camera_1m, "/dev/shm/camera_1m")
		self.style_transfer = cv2.VideoCapture()
		if os.path.exists("/dev/shm/style_transfer"):
			self.open_stream(self.style_transfer, "/dev/shm/style_transfer")

	def __del__(self):
		self.camera_image.release()
		self.camera_1m.release()
		self.style_transfer.release()

	def get_frame(self):
		if (show_camera and self.camera_image.isOpened()):
			success, image = self.camera_image.read()
		elif (show_camera_1m and self.camera_1m.isOpened()):
			success, image = self.camera_1m.read()
		elif (show_style_transfer and self.style_transfer.isOpened()):
			success, image = self.style_transfer.read()
		else:
			image = np.zeros((IMAGE_HEIGHT,IMAGE_WIDTH,3), np.uint8)

		# We are using Motion JPEG, but OpenCV defaults to capture raw images,
		# so we must encode it into JPEG in order to correctly display the
		# video stream.
		if (rescale_image):
			image = cv2.resize(image, (IMAGE_WIDTH, IMAGE_HEIGHT))
		ret, jpeg = cv2.imencode('.jpg', image)
		return jpeg.tobytes()


	def open_stream(self, cap, shmPath):
		if (cap.isOpened()):
			to_node("STREAM", "HALT")
			cap.release()
		while cap.isOpened() is False:
			cap.open("shmsrc socket-path=" + shmPath + " ! video/x-raw, format=BGR, height=" + str(IMAGE_HEIGHT) + ", width=" +
												str(IMAGE_WIDTH) + ", framerate=30/1 ! videoconvert ! video/x-raw, format=BGR ! appsink drop=true", cv2.CAP_GSTREAMER)
		to_node("STREAM", "READY")


cam = VideoCamera()

def check_stdin():
	global show_camera
	global show_camera_1m
	global show_style_transfer
	global cam

	while True:
		lines = sys.stdin.readline()
		try:
			data = json.loads(lines)
			if ('SET' in data):
				setting = data['SET']
				# to_node('status', "Changing: " + setting)
				if (setting == 'CAMERA'):
					show_camera = not show_camera
				elif (setting == 'DISTANCE'):
					show_camera_1m = not show_camera_1m
				elif (setting == 'STYLE_TRANSFER'):
					show_style_transfer = not show_style_transfer
		except:
			to_node("error", "check_std_in error")

t = Thread(target=check_stdin)
t.start()

app = Flask(__name__)


@app.route('/')
def index():
	return render_template('index.html')


def gen(camera):
	while True:
		frame = camera.get_frame()
		yield (b'--frame\r\n'
						b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')

@app.route('/video_feed')
def video_feed():
	return Response(gen(cam), mimetype='multipart/x-mixed-replace; boundary=frame')


if __name__ == '__main__':
	app.run(host='localhost', port=5005, debug=False)
