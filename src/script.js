const canvas = $("canvas")[0];
canvas.width = window.innerWidth / 4;
canvas.height = window.innerHeight / 4;
const context = canvas.getContext("2d");

// const dialogs = {
//
// };

const find_anchor = function(kernel) {
      var anchor = {
            "x": Math.floor(kernel.kernel[Math.floor(kernel.kernel.length / 2)].length / 2),
            "y": Math.floor(kernel.kernel.length / 2)
      };
      return anchor;
}

var kernels = [{
            "name": "Identity",
            "kernel": [
                  [0, 0, 0],
                  [0, 1, 0],
                  [0, 0, 0]
            ]
      },
      {
            "name": "Sharpen",
            "kernel": [
                  [0, -1, 0],
                  [-1, 5, -1],
                  [0, -1, 0]
            ]
      },
      {
            "name": "Box blur",
            "factor": 1 / 9,
            "kernel": [
                  [1, 1, 1],
                  [1, 1, 1],
                  [1, 1, 1]
            ]
      },
      {
            "name": "Gaussian blur (3 by 3)",
            "factor": 1 / 16,
            "kernel": [
                  [1, 2, 1],
                  [2, 4, 2],
                  [1, 2, 1]
            ]
      },
      {
            "name": "Gaussian blur (5 by 5)",
            "factor": 1 / 256,
            "kernel": [
                  [1, 4, 6, 4, 1],
                  [4, 16, 24, 16, 4],
                  [6, 24, 36, 24, 6],
                  [4, 16, 24, 16, 4],
                  [1, 4, 6, 4, 1]
            ]
      },
      {
            "name": "Unsharp Masking",
            "factor": -1 / 256,
            "kernel": [
                  [1, 4, 6, 4, 1],
                  [4, 16, 24, 16, 4],
                  [6, 24, -476, 24, 6],
                  [4, 16, 24, 16, 4],
                  [1, 4, 6, 4, 1]
            ]
      },
      {
            "name": "Custom",
            "kernel": [
                  [0, 0, 0],
                  [0, 1, 0],
                  [0, 0, 0]
            ]
      }
];

kernels.forEach(
      (kernel) => {
            if (!kernel.factor) {
                  kernel.factor = 1;
            }
            if (!kernel.anchor) {
                  kernel.anchor = find_anchor(kernel);
            }
      }
);

var canvas_data;
var dialog = $("dialog#load-image-url")[0];
$("button#load-image-url").click(() => {
      $("dialog#load-image-url input")[0].value = "";
      dialog.showModal();
});
$("dialog#load-image-url button").click(() => dialog.close());
var undo = function(event) {
      context.putImageData(canvas_data, 0, 0);
};
var data = {
      "message": "Image loaded.",
      "timeout": 5000,
      "actionHandler": undo,
      "actionText": "Undo"
};
var snackbarContainer = $('#demo-snackbar-example');
$("dialog#load-image-url .confirm").click(() => {
      canvas_data = context.getImageData(0, 0, canvas.width, canvas.height);
      var url = $("dialog#load-image-url input")[0].value;
      var image = new Image();
      image.onload = function() {
            context.drawImage(image, 0, 0);
      };
      image.crossOrigin = "Anonymous";
      image.src = url;

      snackbarContainer[0].MaterialSnackbar.showSnackbar(data);
});

const spread = function(image_data, width, height, channels) {
      var spread_data = [];
      for (var h = 0; h < height; h++) {
            spread_data.push([]);
            for (var i = 0; i < width; i++) {
                  var index = (((h * width) + i) * channels);
                  spread_data[h].push(
                        Array.prototype.slice.call(
                              image_data.slice(
                                    index, index + channels
                              )
                        )
                  );
            }
      }
      return spread_data;
}

const convolute = function(kernel) {
      var canvas_data = context.getImageData(0, 0, canvas.width, canvas.height);
      // var processed_data = new Uint8ClampedArray(canvas_data.data.length);
      canvas_data = spread(canvas_data.data, canvas.width, canvas.height, 4);
      var processed_data = JSON.parse(JSON.stringify(canvas_data));

      // Current pixel x
      for (var a = 0; a < canvas_data.length - kernel.kernel.length; a++) {
            // Current pixel y
            for (var g = 0; g < canvas_data[a].length - kernel.kernel[0].length; g++) {
                  // Current color channel
                  for (var e = 0; e < 4; e++) {
                        processed_data[a][g][e] = 0;
                        // Current kernel x
                        for (var b = 0; b < kernel.kernel.length; b++) {
                              // Current kernel y
                              for (var c = 0; c < kernel.kernel[b].length; c++) {
                                    // Where the magic happens
                                    // Check if pixel exists
                                    var pix;
                                    // If it does not, set placeholder value to 0
                                    if (canvas_data[x] == undefined || canvas_data[x][y] == undefined) {
                                          pix = 0;
                                    }
                                    // If it does, use actual pixel value
                                    else {
                                          pix = canvas_data[x][y][e];
                                    }
                                    var x = a + b - kernel.anchor.x;
                                    var y = g + c - kernel.anchor.y;
                                    // Multiply pixel value by kernel value
                                    processed_data[a][g][e] += kernel.kernel[b][c] * pix;
                              }
                        }
                        processed_data[a][g][e] *= kernel.factor;
                  }
            }
      }
      processed_data = new Uint8ClampedArray(processed_data.flat().flat());
      processed_data = new ImageData(processed_data, canvas.width, canvas.height);
      context.putImageData(processed_data, 0, 0);
}