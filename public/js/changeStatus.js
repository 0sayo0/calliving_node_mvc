/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/changeStatus.js":
/*!********************************!*\
  !*** ./src/js/changeStatus.js ***!
  \********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n(function () {\r\n  const changeStatusButtons = document.querySelectorAll(\".change-status\");\r\n  const token = document\r\n    .querySelector('meta[name=\"csrf-token\"]')\r\n    .getAttribute(\"content\");\r\n\r\n  changeStatusButtons.forEach((button) => {\r\n    button.addEventListener(\"click\", changeStatusProperty);\r\n  });\r\n\r\n  async function changeStatusProperty(e) {\r\n    const { propertyId: id } = e.target.dataset; //Dataset allows us to access a custom attribute\r\n\r\n    try {\r\n      const url = `/properties/${id}`;\r\n\r\n      const response = await fetch(url, {\r\n        method: \"PUT\",\r\n        headers: {\r\n          \"CSRF-Token\": token,\r\n        },\r\n      });\r\n\r\n      const { result } = await response.json();\r\n\r\n      if (result) {\r\n        if (e.target.classList.contains(\"bg-yellow-100\")) {\r\n          e.target.classList.add(\"bg-green-100\", \"text-green-800\");\r\n          e.target.classList.remove(\"bg-yellow-100\", \"text-yellow-800\");\r\n          e.target.textContent = \"Publicado\";\r\n        } else {\r\n          e.target.classList.add(\"bg-yellow-100\", \"text-yellow-800\");\r\n          e.target.classList.remove(\"bg-green-100\", \"text-green-800\");\r\n          e.target.textContent = \"No publicado\";\r\n        }\r\n      }\r\n    } catch (error) {\r\n      console.error(error);\r\n    }\r\n  }\r\n})();\r\n\n\n//# sourceURL=webpack://bienesraices_mvc/./src/js/changeStatus.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/js/changeStatus.js"](0, __webpack_exports__, __webpack_require__);
/******/ 	
/******/ })()
;