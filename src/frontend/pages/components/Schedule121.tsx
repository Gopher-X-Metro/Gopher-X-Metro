import React, { useEffect, useState } from 'react';

import {
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    TableCaption,
    TableContainer,
    Heading,
  } from '@chakra-ui/react'

  export default function Schedule121(){
    return(
        <div>
            <Heading as='h1' size='md' margin = '5'>121 Campus Connector</Heading>
            <TableContainer>
                <Table variant='striped'>
                    <TableCaption>Only for Fall/Spring Semesters and Finals</TableCaption>
                    <Thead>
                    <Tr>
                        <Th>Days</Th>
                        <Th>Times</Th>
                        <Th>Frequency</Th>
                    </Tr>
                    </Thead>
                    <Tbody>
                    <Tr>
                        <Td>Monday-Friday</Td>
                        <Td>7:00 am – 7:30 am</Td>
                        <Td>every 10 minutes</Td>
                    </Tr>
                    <Tr>
                        <Td>Monday-Friday</Td>
                        <Td>7:30 am – 6:30 pm</Td>
                        <Td>every 5 minutes</Td>
                    </Tr>
                    <Tr>
                        <Td>Monday-Friday</Td>
                        <Td>6:30 pm – 10:00 pm</Td>
                        <Td>every 15 minutes</Td>
                    </Tr>
                    <Tr>
                        <Td>Monday-Wednesday</Td>
                        <Td>10:00 pm – 12:15 am</Td>
                        <Td>every 20 minutes</Td>
                    </Tr>
                    <Tr>
                        <Td>Thursday-Friday</Td>
                        <Td>10:00 pm – 2:00 am</Td>
                        <Td>every 20 minutes</Td>
                    </Tr>
                    <Tr>
                        <Td>Saturday</Td>
                        <Td>9:30 am – 2:00 am</Td>
                        <Td>every 20 minutes</Td>
                    </Tr>
                    <Tr>
                        <Td>Sunday</Td>
                        <Td>9:30 am – 12:15 am</Td>
                        <Td>every 20 minutes</Td>
                    </Tr>
                    </Tbody>
                    {/* <Tfoot>
                    <Tr>
                        <Th>To convert</Th>
                        <Th>into</Th>
                        <Th isNumeric>multiply by</Th>
                    </Tr>
                    </Tfoot> */}
                </Table>
            </TableContainer>
        </div>
    )
  }