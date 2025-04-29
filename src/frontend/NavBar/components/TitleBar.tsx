import React from "react"
import { Heading, Box } from "@chakra-ui/react"
import ClearAll from "./ClearAll";

/**
 * TitleBar Component
 * 
 * Component renders title "Gopher X Metro" with custom styling.
 * 
 * @returns rendered TitleBar component
 */
export default function TitleBar() {
    const xStyle = {
        background: "linear-gradient(to right, #FFCC33 50%, #0053A0 50%)",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
    };

    return (
        <Box onClick={ClearAll.clearRoutes}>
            <Heading display="inline-block" color="#FFCC33" margin="1">Gopher</Heading>
            <Heading display="inline-block" margin="1" style={xStyle}>X</Heading>
            <Heading display="inline-block" color="#0053A0" margin="1">Metro</Heading>
        </Box>
    );
}