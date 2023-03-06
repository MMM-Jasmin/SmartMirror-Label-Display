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
	"person",
	"face",
	"left",
	"right",
	"left_fist",
	"right_fist",
	"left_one",
	"right_one",
	"left_two",
	"right_two",
	"left_three",
	"right_three",
	"left_four",
	"right_four",
	"left_five",
	"right_five",
	"left_flat",
	"right_flat",
	"left_spock",
	"right_spock",
	"left_fuck",
	"right_fuck",
	"left_hangloose",
	"right_hangloose",
	"left_tumbs_up",
	"right_tumbs_up",
	"left_tumbs_down",
	"right_tumbs_down",
	"left_okay",
	"right_okay",
	"left_fingers_crossed",
	"right_fingers_crossed",
	"left_italian",
	"right_italian",
	"left_pistol",
	"right_pistol",
	"left_silent_fox",
	"right_silent_fox",
	"left_rock",
	"right_rock",
	"left_size",
	"right_size"	
];

var gesture_icons = {
	right_flat: { className: "fas fa-hand-paper", unicode: "\uf256" },
	left_flat: { className: "fas fa-hand-paper fa-flip-horizontal" },
	right_two: { className: "fas fa-hand-peace", unicode: "\uf25b" },
	left_two: { className: "fas fa-hand-peace fa-flip-horizontal" },
	right_one: { className: "fas fa-hand-point-up", unicode: "\uf0a6" },
	left_one: { className: "fas fa-hand-point-up fa-flip-horizontal" },
	right_fist: { className: "fas fa-hand-rock", unicode: "\uf255" },
	left_fist: { className: "fas fa-hand-rock fa-flip-horizontal" },
	right_fuck: { className: "fas fa-hand-middle-finger", unicode: "\uf806" },
	left_fuck: { className: "fas fa-hand-middle-finger fa-flip-horizontal" },
	left_tumbs_up: { className: "fas fa-thumbs-up", unicode: "\uf164" },
	right_tumbs_up: { className: "fas fa-thumbs-up fa-flip-horizontal" },
	left_tumbs_down: { className: "fas fa-thumbs-down", unicode: "\uf165" },
	right_tumbs_down: { className: "fas fa-thumbs-down fa-flip-horizontal" },
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
