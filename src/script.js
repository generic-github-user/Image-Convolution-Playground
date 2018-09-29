const canvas = $("canvas")[0];
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const context = canvas.getContext("2d");

// const dialogs = {
//
// };

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