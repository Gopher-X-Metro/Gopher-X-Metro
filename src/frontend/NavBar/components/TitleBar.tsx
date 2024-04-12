import React from "react"
import { Heading } from "@chakra-ui/react"


export default function TitleBar(){

    const xStyle = {
        'background': "linear-gradient(to right, #FFCC33 50%, #0053A0 50%)",
        'background-clip': 'text',
        'WebkitBackgroundClip': 'text',
        'WebkitTextFillColor': 'transparent',
    }

    return(
        <div>
            <Heading as='h1' size='2xl' pos='absolute' top='1.5' left='200'>
                <Heading display='inline-block' color='#FFCC33' margin='1'>Gopher Buses </Heading>
                <Heading display='inline-block' margin='1' style={xStyle}> X </Heading>
                <Heading display='inline-block' color ='#0053A0' margin='1'> Metro Buses </Heading>
            </Heading>
        </div>
        
    )
}
