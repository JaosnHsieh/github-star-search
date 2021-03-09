#!/usr/bin/env node
import React from "react";
import { render } from "ink";
import App from "./ui";

export const cli = () => {
	render(<App />);
};
