import React from "react"
import { Heading, Box } from "@chakra-ui/react"


export default function TitleBar(){
    const xStyle = {
        'background': "linear-gradient(to right, #FFCC33 50%, #0053A0 50%)",
        'backgroundClip': 'text',
        'WebkitBackgroundClip': 'text',
        'WebkitTextFillColor': 'transparent',
    }

    return(
            <Box>
                <Heading display='inline-block' color='#FFCC33' margin='1'>Gopher </Heading>
                <Heading display='inline-block' margin='1' style={xStyle}> X </Heading>
                <Heading display='inline-block' color ='#0053A0' margin='1'> Metro </Heading>
            </Box>
        
    )
}
