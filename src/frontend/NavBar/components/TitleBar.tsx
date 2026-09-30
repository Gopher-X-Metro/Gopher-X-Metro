import React from "react"
import { Heading, Box } from "@chakra-ui/react"

// Chakra v2's default heading size (v3's is smaller); a notch smaller on phones so it fits on one line
const SIZE = { fontSize: { base: "2xl", md: "4xl" }, fontWeight: "bold", lineHeight: "1.2" } as const;


export default function TitleBar(){
    const xStyle = {
        'background': "linear-gradient(to right, #FFCC33 50%, #0053A0 50%)",
        'backgroundClip': 'text',
        'WebkitBackgroundClip': 'text',
        'WebkitTextFillColor': 'transparent',
    }

    return(
            <Box>
                <Heading {...SIZE} display='inline-block' color='#FFCC33' margin='1'>Gopher </Heading>
                <Heading {...SIZE} display='inline-block' margin='1' style={xStyle}> X </Heading>
                <Heading {...SIZE} display='inline-block' color ='#0053A0' margin='1'> Metro </Heading>
            </Box>
        
    )
}
