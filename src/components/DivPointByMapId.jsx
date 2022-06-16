import { useState, useEffect } from "react";
import { Heading, Box, Text, List, ListItem, ListIcon, Link } from "@chakra-ui/react";
import { ChevronRightIcon } from '@chakra-ui/icons'

import * as api from "strateegia-api";
import { fetchMapsById } from "./indicators";


export default function DivPointByMapId({ mapId }) {
    const accessToken = localStorage.getItem("accessToken");
    const [kits, setKits] = useState([]);
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState([]);
    
    useEffect(() => {
        console.log("🚀 ~ file: DivPointByMapId.jsx ~ line 10 ~ DivPointByMapId ~ mapId", mapId)
        async function getAllDivPointsByMapId() {
            const result = await fetchMapsById(accessToken, mapId, api.getAllDivergencePointsByMapId);
            const content = result.length > 1 ? result.map(({content}) => content.flat()) : result.content;
            // console.log("🚀 ~ file: DivPointByMapId.jsx ~ line 20 ~ getAllDivPointsByMapId ~ result.length", result.length)
            // console.log("🚀 ~ file: DivPointByMapId.jsx ~ line 19 ~ getAllDivPointsByMapId ~ content",content, content.flat());
            return content.flat();
        }

        getAllDivPointsByMapId().then(data => {
            console.log("🚀 ~ file: DivPointByMapId.jsx ~ line 38 ~ getAllDivPointsByMapId ~ data", data)
            setContent(data || ['oi'])
        });
    }, [mapId]);

    useEffect(() => {
        console.log("🚀 ~ file: DivPointByMapId.jsx ~ line 47 ~ content.map ~ content", content)
        const kitsArr = [];
            content.map((cont) => {
                kitsArr.push({
                    divPointId: cont.id,
                    kitId: cont.tool.id,
                    kitTitle: cont.tool.title,
                    questions: cont.tool.questions,
                })
            })
            setKits(kitsArr);
    }, [content])

    useEffect(() => {
        kits.map(kit => 
            kit.questions.map(question =>  {
                setComments([])
                api.getParentComments(accessToken, kit.divPointId, question.id).then(({content})=> {
                    content.map(cont => {
                        setComments(c => [...c, {
                            kitTitle: kit.kitTitle,
                            question: question.question,
                            author: cont.author,
                            id: cont.id,
                            text: cont.text}])
                    });
                })
            }))
           
    }, [kits]);

    return (
        <>
            <Box>
                <Heading as="h2" size="lg" m={'15px 2px'}>Índice</Heading>
                <List spacing={3} maxW='80vw' display='flex' flexDir='column' flexWrap='wrap'  >
                    {kits.map(({kitTitle, kitId}) => (
                        <ListItem>
                            <Link href={`#${kitId}`}>
                                <ListIcon as={ChevronRightIcon} color='blue'/>
                                {kitTitle}
                            </Link>
                        </ListItem>
                    ))}
                </List>
            </Box>
            <Box mt='50px' display='flex' flexDir='column' alignItems='center'>
                {kits.map(({kitTitle, questions, kitId}) => (
                    <>
                        <Heading as="h2" size="lg" m={'10px 2px'} id={kitId}>Kit: {kitTitle}</Heading>
                        {questions.map(({question}) => (
                            <>
                            <Text fontSize={'24px'} fontWeight='600' m='30px 0' w='40%' textAlign='center'>Questão: {question}</Text>
                            {comments.filter(kit => kit.kitTitle === kitTitle)
                                .map(({author, text}) => (
                                    <>
                                        <Text m='12px' w='60%'><strong>{author.name}</strong>: {text}</Text>
                                    </>
                                ))}
                            </>
                        ))}
                    </>
                ))}
            </Box>
        </>
    )

}
