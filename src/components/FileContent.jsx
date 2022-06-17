import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import PizZipUtils from "pizzip/utils/index.js";
import { reportsCockpit } from '../assets/file' 
import { saveAs } from "file-saver"; 

function loadFile(url, callback) {
    PizZipUtils.getBinaryContent(url, callback);
}

export const generateDocument = (mapId, kits, comments) => {

    loadFile(
        reportsCockpit,
        function (error, content) {
            if (error) {
                throw error;
            }
            const zip = new PizZip(content);
            const doc = new Docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
            });
            const docData = []
            mapId.map(({label, value}) => {
                const data = {
                    map_title: label,
                    questions: kits.filter(({mapId}) => mapId === value)
                    .map(({kitTitle, questions}) => {
                        return {
                            kit_title: kitTitle,
                            question_title: questions.map(({question}) => question),
                            comments: comments.filter(kit => kit.kitTitle === kitTitle)
                            .map(({author, text}) => {
                                return {
                                    user: author.name + ':',
                                    comment: text
                                }
                            })
                        }
                    })
                }
                docData.push(data)   
            });

            doc.render({
                'map': docData.flat()
            });

            const out = doc.getZip().generate({
                type: "blob",
                mimeType:
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            }); 
            saveAs(out, "strateegia_kit_visual_structure-docx.docx");
        }
    );
}
