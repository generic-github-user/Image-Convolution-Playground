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

console.log("kernels.js loaded");