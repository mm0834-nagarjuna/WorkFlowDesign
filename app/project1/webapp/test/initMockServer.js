sap.ui.define([
	"project1/localService/mockServer"
], function (mockserver) {
	"use strict";
    debugger
	// initialize the mock server
	
	mockserver.init();

	// initialize the embedded component on the HTML page
	sap.ui.require(["sap/ui/core/ComponentSupport"]);
});