# SmartMirror-Label-Display
[LEGaTO-SmartMirror](https://github.com/LEGaTO-SmartMirror) and therefore [MagicMirror²](https://github.com/MichMich/MagicMirror) module for displaying a camera image and overlay labels of detected classes.
The camera image is fetched from the shared memory sinks provided by the  [SmartMirror-Camera-Publisher](https://github.com/LEGaTO-SmartMirror/SmartMirror-Camera-Publisher) and shown in the background. Class labels provided by the modules [SmartMirror-Object-Detection](https://github.com/LEGaTO-SmartMirror/SmartMirror-Object-Detection), [SmartMirror-SmartMirror-Gesture-Recognition](https://github.com/LEGaTO-SmartMirror/SmartMirror-Gesture-Recognition), [SmartMirror-Facerecognition](https://github.com/LEGaTO-SmartMirror/SmartMirror-Facerecognition) and  [SmartMirror-Person-Recognition](https://github.com/LEGaTO-SmartMirror/SmartMirror-Person-Recognition) are displayed by creating bounding boxes and text captions as HTML div elements.

## Configuration
The module can be configured by setting the desired values in the MagicMirror `config.js`

#### Display
- `image_width` and `image_height`: Integers; Default: 1920 x 1080
Sets the dimensions of the camera image. 
- `maxFPS` Integer; Default is 60.
Limits the framerate at which the display is refreshed. The detected class labels are pushed by messages asynchroniously so this value provides the timing when to draw the current camera image and labels. Should not be less than the refresh rate of the detections.
- `showGesturesIcons` Boolean; Default: true
Flag for showing a FontAwesome icon at the bounding box position for detected gestures. Only available for a subset of hand gestures. Mirrors icon for left hand gestures.

#### Bounding Boxes
- `lineWidth` Integer; Default: 2
Sets the border width of the drawn bounding boxes.

#### Captions
- `textAbove` boolean; default: false
If true puts the text caption above the bounding box without linebreaks. If false the text is put inside the bounding box at the top left corner with a new line for each information field.
- `fontFamily` string; default: "Font Awesome 5 Free"
Sets the font family of the text captions.
- `fontSize` integer; default: 24
Sets the font size and respectively the font height in pixels.
- `textMargin` integer; default: 3
Defines the margin between the text and the bounding box to all sides in pixels.

#### Colors
Formats: Color strings respect CSS color formats: The string can be one of: name, hex, rgb, rgba, hsl, hsla. Examples: "red", "#ff6347", "rgb(255, 99, 71)", "rgba(255, 99, 71, 0.5)", "hsl(9, 100%, 64%)", "hsla(9, 100%, 64%, 0.5)"

- `textColor` string; default: ""
Sets the color of text captions. If empty the text gets the same color as the corresponding bounding box.
- `gesturesColor` string; default: ""
Sets the color of gesture bounding boxes. If empty every hand gesture class gets a different color.
- `objectsColor` String; default: "blue"
Sets the color of object bounding boxes.
- `facesColor` string; default: "orange"
Sets the color of face bounding boxes.
- `personsColor` string; default: "green"
Sets the color of person bounding boxes.

## Communication
Received MagicMirror messages:

message | action | payload
 ------- | ------- | ------
`LABEL_DISPLAY` <br>`CENTER_DISPLAY` | Change display setting  | `TOGGLE`, `DISTANCE`, `GESTURE, OBJECT`, `FACE, PERSON`, `SHOWALL`, `HIDEALL`, `STYLE_TRANSFERE`
`DETECTED_GESTURES` | Send detected gestures | `{"DETECTED_GESTURES": [{"TrackID": int, "name": string, "w_h": (float, float), "center": (float, float)}]}`
`DETECTED_OBJECTS` | Send detected objects | `{"DETECTED_OBJECTS": [{"TrackID": int, "name": string, "w_h": (float, float), "center": (float, float)}]}`
`DETECTED_FACES` | Send detected faces  | `{"DETECTED_FACES":  [{"TrackID": int, "name": string, "w_h": (float, float), "center": (float, float), "id": int, "confidence": float}]}`
`RECOGNISED_PERSONS` | Send recognised persons | `[{"TrackID": int, "name": string, "w_h": (float, float), "center": (float, float), "face": {...}, "gesture": {...}}]`

Background camera image shared memory sources:

- `/dev/shm/camera_image`
Affected by: `TOGGLE`, `SHOWALL`, `HIDEALL`
- `/dev/shm/camera_1m`
Affected by: `DISTANCE`, `SHOWALL`, `HIDEALL`
- `/dev/shm/style_transfer`
Affected by: `STYLE_TRANSFERE`, `SHOWALL`, `HIDEALL`

## Requirements
Versions relate to tested library versions.

Python 3.6.9 with modules:

- OpenCV 4.3.0
- Flask 1.1.2
- Json 2.0.9
- Numpy 1.18.2
- Threading
- Os
- Sys

## Installation
To install SmartMirror-Label-Display module on an existing SmartMirror instance:

- Clone SmartMirror-Label-Display to the MagicMirror module folder.
- Add module section to the MagicMirror `config.js`:
```
{
	module: 'SmartMirror-Label-Display',
	position: 'fullscreen_below',
	config: {
		image_width: 1920,
		image_height: 1080,
	}
},
```
- Add to `modules/SmartMirror-Decision-Maker.js` `module_list` array:
`{name : "SmartMirror-Label-Display", words : ["labeldisplay"]},`
- Add column for new SmartMirror module to MySQL database. Example for user with ID 0:
``mysql> ALTER TABLE mydb.login_view ADD COLUMN labeldisplay TinyInt(1) DEFAULT 0;``
``mysql> UPDATE mydb.login_view SET labeldisplay='1' WHERE user_ID='0';``