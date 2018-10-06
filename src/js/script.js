// URL of currently loaded image
var image_url = "";
// Current filter kernel to apply to image
// Default filter is 1 (sharpen)
var filter = 1;
var iterations = 1;
var automatic_update = true;

// https://stackoverflow.com/a/23202637
function map(num, in_min, in_max, out_min, out_max) {
      return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

const update_settings = function() {
      automatic_update = $("input#automatic-update")[0].checked;
      if (automatic_update) {
            set_filter();
      }
}

// Change resolution of images
const set_resolution = function(func) {
      var resolution = $("input#resolution")[0].value;
      $("p#resolution").text("Resolution - " + resolution + " pixels");

      canvas_width = resolution;
      canvas_height = resolution;
      input_canvas.width = canvas_width;
      input_canvas.height = canvas_height;
      output_canvas.width = canvas_width;
      output_canvas.height = canvas_height;
      load_image({
            callback: func
      });
}

// Sample images to load by default when the program is opened (flowers)
var images = [
      "https://i.imgur.com/svViHqm.jpg",
      "https://i.imgur.com/uAhjMNd.jpg",
      "https://i.imgur.com/u5OUfBF.jpg",
      "https://i.imgur.com/PT3Nh7B.jpg",
      "https://i.imgur.com/EtXIdFP.jpg"
];

const find_anchor = function(kernel) {
      var anchor = {
            "x": Math.floor(kernel.kernel[Math.floor(kernel.kernel.length / 2)].length / 2),
            "y": Math.floor(kernel.kernel.length / 2)
      };
      return anchor;
}

var saved_url;
// Undo function for snackbar action button
var undo = function(event) {
      // Replace stored image onto canvas
      load_image({
            url: saved_url,
            // Apply current filter to image
            callback: set_filter
      });
      display_snackbar("Action undone.", 2.5);
};
// Display a snackbar notification given a message string
const display_snackbar = function(message, time) {
      var data = {
            "message": message,
            "timeout": (time * 1000),
            "actionHandler": undo,
            "actionText": "Undo"
      };
      var snackbarContainer = $("#snackbar");
      snackbarContainer[0].MaterialSnackbar.showSnackbar(data);
}
$("dialog#load-image-url .confirm").click(() => {
      load_image({
            url: $("dialog#load-image-url input")[0].value,
            callback: set_filter
      });
      display_snackbar("Image loaded.", 5);
});

// Adapted from https://stackoverflow.com/a/22369599
const read_file = function() {
      // Get file from file upload element
      var file = $("input#load-image-upload")[0].files[0];
      // Create new FileReader object
      var reader = new FileReader();

      // Set function to execute when file has been read
      reader.onloadend = function() {
            // Display image upload confirmation snackbar message
            display_snackbar("Image uploaded: " + file.name);
            // Load image to canvas and apply convolutional filter
            load_image({
                  url: reader.result,
                  callback: set_filter
            });
      }

      // Check if a file has been uploaded
      if (file) {
            // Read image data as a data URL
            reader.readAsDataURL(file);
      }
}

// Prepare filter kernels for use in image convolution operations; fill in missing properties
kernels.forEach(
      (kernel) => {
            // If kernel factor does not exist, set it to 1
            if (!kernel.factor) {
                  kernel.factor = 1;
            }

            // If kernel anchor coordinates are not listed, calculate them
            if (!kernel.anchor) {
                  kernel.anchor = find_anchor(kernel);
            }
      }
);

// Loop through each kernel and add it to the dropdown menu
for (var j = 0; j < kernels.length; j++) {
      // Create new list item element
      var item = $("<li class='mdl-menu__item'></li>");
      // Set name of list item to match kernel
      item.text(kernels[j].name);
      // Set onclick function for list item
      item.attr("onclick", "set_filter(" + j + ")");
      // Add list item to dropdown
      $("ul#kernels").append(item);
}
// Apply a filter kernel to the currently loadked image and display the result on the canvas
const set_filter = function(kernel_id) {
      // Check to see if a filter kernel ID has been provided
      if (kernel_id != undefined) {
            // Set the filter to the provided filter kernel ID
            filter = kernel_id;
            // If a filter was not provided, use the currently set kernel
      }

      var iterations_field = $("input#repeat-filter")[0];
      if (iterations_field.value == undefined || iterations_field.value == "") {
            iterations = 1;
      } else if (parseInt(iterations_field.value) < 1 || parseInt(iterations_field.value) > 100) {
            //  || /-?[0-9]*(\.[0-9]+)?/.test(iterations_field.value) == false
            iterations_field.value = 1;
            iterations = parseInt(iterations_field.value);
      } else {
            iterations = parseInt(iterations_field.value);
      }

      // Display filter kernel visualization
      // Clear HTML of visualization <div>
      $("#kernel-vis").empty();
      for (var k = 0; k < kernels[filter].kernel.length; k++) {
            // Create row div element
            var row = $("<div></div>");
            // Add row css class to row element
            row.addClass("row");
            row.css("height", Math.round((100 / kernels[filter].kernel.length) - 2) + "%");
            for (var l = 0; l < kernels[filter].kernel[k].length; l++) {
                  // Abbreviations
                  var kernel = kernels[filter].kernel;
                  var weight = kernel[k][l];

                  var block = $("<button>" + weight + "</button>");
                  block.css("min-width", Math.round((100 / kernels[filter].kernel[k].length) - 2) + "%");

                  // Get maximum weight value of filter kernel
                  // https://stackoverflow.com/a/39342975
                  var maxRow = kernel.map(function(row) {
                        return Math.max.apply(Math, row);
                  });
                  var max = Math.max.apply(null, maxRow);

                  // Get minimum weight value
                  var minRow = kernel.map(function(row) {
                        return Math.min.apply(Math, row);
                  });
                  var min = Math.min.apply(null, maxRow);

                  // Map filter kernel weight range to color saturation range
                  var saturation = map(weight, min, max, 25, 75);
                  // Create color string in hsla format
                  var color = "hsla(200, 100%, " + saturation + "%, 1)";
                  // Set background color of block
                  block.css("background-color", color);
                  // Add relevant css classes to block
                  block.addClass("block mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored");
                  // Add block to row
                  row.append(block);
            }
            // Add row element to visualization div element
            $("#kernel-vis").append(row);
      }

      // Update filter select dropdown button to display name of current filter
      $("button#select-filter").html(kernels[filter].name + '<i class="material-icons">arrow_drop_down</i>');

      // Update "apply filter" button to reflect currently selected filter kernel and filter repetitions
      var button_text = "Apply " + kernels[filter].name;
      if (iterations > 1) {
            button_text += " " + iterations + " times";
      }
      $("button#apply-filter").text(button_text);

      // Update all MDL components in DOM
      componentHandler.upgradeDom();

      if (automatic_update) {
            apply_filter();
      }
}

// Apply convolutional filter to image and display image on output canvas
const apply_filter = function() {
      // Get image data from canvas
      var canvas_data = input_context.getImageData(0, 0, canvas_width, canvas_height);
      // Run convolution operation on image data from canvas with given kernel
      var processed_data = canvas_data;
      for (var o = 0; o < iterations; o++) {
            processed_data = convolute(processed_data, kernels[filter]);
      }
      // Draw processed image data to canvas
      output_context.putImageData(processed_data, 0, 0);
}

// Load an image into memory using a URL and draw it to the canvas
const load_image = function(config) {
      // Store image URL in saved_url in case the user undoes the image load operation
      saved_url = image_url;
      if (config) {
            if (config.url) {
                  image_url = config.url;
            }
      }
      // Create a new image object
      var image = new Image();
      // Set onload function for image to execute once the image has loaded
      image.onload = function() {
            // Draw image to canvas
            input_context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas_width, canvas_height);
            // Execute callback function
            if (config) {
                  if (config.callback) {
                        config.callback();
                  }
            }
      };
      // Set crossOrigin property of image object to "Anonymous" to allow loading images from other domains (when permitted)
      image.crossOrigin = "Anonymous";
      // Set image source to url
      image.src = image_url;
}

var canvas_data;
var dialog = $("dialog#load-image-url")[0];
$("button#load-image-url").click(() => {
      $("dialog#load-image-url input")[0].value = "";
      dialog.showModal();
});
$("dialog#load-image-url button").click(() => dialog.close());

// Spread 1D image vector to a 3D array given width, height, and number of color channels
const spread = function(image_data, width, height, channels) {
      // Create variable to store processed image data in
      var spread_data = [];
      // Loop through each row (y) of image
      for (var h = 0; h < height; h++) {
            // Create new array inside of main array to store color channels of pixel
            spread_data.push([]);
            // Loop through each pixel (x) in row of image
            for (var i = 0; i < width; i++) {
                  // Generate index of pixel in original image data array from x and y position of pixel, and width and color channels of image
                  var index = ((h * width) + i) * channels;
                  // Add pixel data to spread array
                  spread_data[h].push(
                        // Convert data from Uint8ClampedArray to standard Array
                        Array.prototype.slice.call(
                              // Slice color channels of pixel from main array using index value
                              image_data.slice(
                                    index, index + channels
                              )
                        )
                  );
            }
      }
      // Return 3D image data array
      return spread_data;
}

// Apply convolution operation to image data given image and filter kernel
const convolute = function(image, kernel) {
      // Convert 1-dimensional canvas pixel data array into a 3-dimensional array using spread()
      canvas_data = spread(image.data, canvas_width, canvas_height, 4);
      // Create a new array, processed_data, as a clone of canvas_data to store output image
      var processed_data = JSON.parse(JSON.stringify(canvas_data));

      // Current pixel x
      for (var a = 0; a < canvas_data.length; a++) {
            // Current pixel y
            for (var g = 0; g < canvas_data[a].length; g++) {
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
                                    // Calculate x coordinate of pixel relative to anchor pixel; original coordinate + filter kernel offset - relative kernel anchor position
                                    var x = a + b - kernel.anchor.x;
                                    // Calculate y coordinate of pixel
                                    var y = g + c - kernel.anchor.y;
                                    // Multiply pixel value by kernel value, then add to anchor pixel value
                                    processed_data[a][g][e] += kernel.kernel[b][c] * pix;
                              }
                        }
                        // Multiply pixel color channel by kernel factor
                        processed_data[a][g][e] *= kernel.factor;
                  }
            }
      }
      // Flatted processed image data into a 1-dimensional array and convert to a Uint8ClampedArray so that it can be made into an ImageData object
      processed_data = new Uint8ClampedArray(processed_data.flat().flat());
      // Create new ImageData object from processed image data
      processed_data = new ImageData(processed_data, canvas_width, canvas_height);
      // Return filtered image data as ImageData object
      return processed_data;
}

set_resolution(set_filter);
// Load random image and apply convolutional filter
load_image({
      // Select a random image from the list of demo images
      url: random_image = images[Math.floor(Math.random() * images.length)],
      callback: set_filter
});

// https://stackoverflow.com/a/5445536
var cw = $('#kernel-vis').width();
$('#kernel-vis').css({
      'height': cw + 'px'
});