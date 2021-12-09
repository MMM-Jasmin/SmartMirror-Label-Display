// Base RGB colors
var base_colors = [
	[60, 180, 75], // green
	[230, 25, 75], // red
	[70, 240, 240], // cyan
	[210, 245, 60], // lime
	[145, 30, 180], // purple
	[240, 50, 230], // magenta
	[245, 130, 48], // orange
	[0, 130, 200], // blue
	[255, 225, 25], // yellow
	[0, 0, 128], // navy
];

// Names of hand gestures
var gesture_names = [
	"fist_right",
	"fist_left",
	"one_right",
	"one_left",
	"two_right",
	"two_left",
	"scissors_right",
	"scissors_left",
	"three_right",
	"three_left",
	"four_right",
	"four_left",
	"thumbs_up_right",
	"thumbs_up_left",
	"thumbs_down_right",
	"thumbs_down_left",
	"thumbs_right_right",
	"thumbs_right_left",
	"thumbs_left_right",
	"thumbs_left_left",
	"three_thumb_right",
	"three_thumb_left",
	"two_thumb_right",
	"two_thumb_left",
	"point_right",
	"point_left",
	"flat_right",
	"flat_left",
	"okay_right",
	"okay_left",
	"fuck_off_right",
	"fuck_off_left",
];

var gesture_icons = {
	flat_right: { className: "fas fa-hand-paper", unicode: "\uf256" },
	flat_left: { className: "fas fa-hand-paper fa-flip-horizontal" },
	two_right: { className: "fas fa-hand-peace", unicode: "\uf25b" },
	two_left: { className: "fas fa-hand-peace fa-flip-horizontal" },
	one_right: { className: "fas fa-hand-point-up", unicode: "\uf0a6" },
	one_left: { className: "fas fa-hand-point-up fa-flip-horizontal" },
	fist_right: { className: "fas fa-hand-rock", unicode: "\uf255" },
	fist_left: { className: "fas fa-hand-rock fa-flip-horizontal" },
	scissors: { className: "fas fa-hand-scissors", unicode: "\uf257" },
	scissors: { className: "fas fa-hand-scissors fa-flip-horizontal" },
	point_right: { className: "fas fa-hand-point-right", unicode: "\uf0a4" },
	point_left: { className: "fas fa-hand-point-right fa-flip-horizontal" },
	fuck_off_right: { className: "fas fa-hand-middle-finger", unicode: "\uf806" },
	fuck_off_left: { className: "fas fa-hand-middle-finger fa-flip-horizontal" },
	thumbs_up_left: { className: "fas fa-thumbs-up", unicode: "\uf164" },
	thumbs_up_right: { className: "fas fa-thumbs-up fa-flip-horizontal" },
	thumbs_down_left: { className: "fas fa-thumbs-down", unicode: "\uf165" },
	thumbs_down_right: { className: "fas fa-thumbs-down fa-flip-horizontal" },
	thumbs_left_right: { className: "fas fa-thumbs-up fa-rotate-270" },
	thumbs_right_right: { className: "fas fa-thumbs-dow fa-rotate-270" },
	thumbs_left_left: { className: "fas fa-thumbs-up fa-rotate-270" },
	thumbs_right_left: { className: "fas fa-thumbs-dow fa-rotate-270" },
};

/**
 * Returns a RGB color for a given index.
 * @param index The index to get a color for.
 * @param hexFormat If true return color as hexadecimal css string.
 * @return The gesture RGB color as array.
 */
function getColorForIndex(index, hexFormat = true) {
	const saturationStep = 50;
	const baseColorIndex = index % base_colors.length;
	const saturationMultiplier = Math.floor(index / base_colors.length);
	var color = Array.from(base_colors[baseColorIndex]);

	// First 10 gestures get the base colors, followings get saturation reduced by saturationStep
	for (var i = 0; i < 3; i++) {
		var colorComponent = color[i] + saturationStep * saturationMultiplier;
		if (colorComponent > 255) {
			colorComponent = 255;
		}
		color[i] = colorComponent;
	}

	if (hexFormat) {
		var hexString = "#";
		for (var i = 0; i < 3; i++) {
			hexString += color[i].toString(16).padStart(2, "0");
		}
		return hexString;
	} else {
		return color;
	}
}
