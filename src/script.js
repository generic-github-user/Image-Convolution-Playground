const canvas = $("canvas")[0];
canvas.width = window.innerWidth / 4;
canvas.height = window.innerHeight / 4;
const context = canvas.getContext("2d");

var images = [
      "https://i.imgur.com/svViHqm.jpg",
      "https://i.imgur.com/uAhjMNd.jpg",
      "https://i.imgur.com/u5OUfBF.jpg",
      "https://i.imgur.com/PT3Nh7B.jpg",
      "https://i.imgur.com/EtXIdFP.jpg"
];

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

kernels.forEach(
      (kernel) => {
            if (!kernel.factor) {
                  kernel.factor = 1;
            } else {
                  kernel.factor = eval(kernel.factor);
            }

            if (!kernel.anchor) {
                  kernel.anchor = find_anchor(kernel);
            }
      }
);

for (var j = 0; j < kernels.length; j++) {
      var item = $("<li class='mdl-menu__item'></li>");
      item.text(kernels[j].name);
      item.attr("onclick", "set_filter(" + j + ")");
      $("ul#kernels").append(item);
}
componentHandler.upgradeDom("mdl-menu");
const set_filter = function(kernel_id) {
      $("button#select-filter").html(kernels[kernel_id].name + '<i class="material-icons">arrow_drop_down</i>');
      var canvas_data = context.getImageData(0, 0, canvas.width, canvas.height);
      var processed_data = convolute(canvas_data, kernels[kernel_id]);
      context.putImageData(processed_data, 0, 0);
}

const load_image = function(url, callback) {
      var image = new Image();
      image.onload = function() {
            context.drawImage(image, 0, 0);
            callback();
      };
      image.crossOrigin = "Anonymous";
      image.src = url;
}

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
      load_image(url);

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

const convolute = function(image, kernel) {
      // var processed_data = new Uint8ClampedArray(canvas_data.data.length);
      canvas_data = spread(image.data, canvas.width, canvas.height, 4);
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
      return processed_data;
}

var image = images[Math.floor(Math.random() * images.length)];
load_image(image, () => set_filter(1));