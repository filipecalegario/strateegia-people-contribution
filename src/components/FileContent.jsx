import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import PizZipUtils from "pizzip/utils/index.js";
import { reportsCockpit } from '../assets/files' 
import { saveAs } from "file-saver"; 

function loadFile(url, callback) {
    PizZipUtils.getBinaryContent(url, callback);
}

export const generateDocument = (usersScore) => {

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

            const docData = usersScore.map((user, i) => {
                const blueRow = {
                    'hasBlue': true,
                    'hasWhite': false,
                    'name': user.name,
                    'metrica1': user.metrica1,
                    'metrica2': user.metrica2,
                    'score': user.score,
                };
                const whiteRow = {
                    'hasBlue': false,
                    'hasWhite': true,
                    'name_2': user.name,
                    'metrica1_2': user.metrica1,
                    'metrica2_2': user.metrica2,
                    'score_2': user.score,
                };

                return i % 2 == 0 ? blueRow : whiteRow;
            
            });

            doc.render({
                'influencers': docData
            });

            const out = doc.getZip().generate({
                type: "blob",
                mimeType:
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            }); //Output the document using Data-URI
            saveAs(out, "strateegia_influential_report-docx.docx");
        }
    );

}
