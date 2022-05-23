let users = [];
let questions = [];
let preRows = [];
let postRows = [];
let columnsGlobal = [];

async function initializeProjectList() {
    const labs = await getAllProjects(accessToken);
    console.log("getAllProjects()");
    console.log(labs);
    let listProjects = [];
    for (let i = 0; i < labs.length; i++) {
        let currentLab = labs[i];
        if (currentLab.lab.name == null) {
            currentLab.lab.name = "Personal";
        }
        for (let j = 0; j < currentLab.projects.length; j++) {
            const project = currentLab.projects[j];
            const newProject = {
                "id": project.id,
                "title": project.title,
                "lab_id": currentLab.lab.id,
                "lab_title": currentLab.lab.name
            };
            listProjects.push(newProject);
        }
    }

    let options = d3.select("#projects-list");
    options.selectAll('option').remove();
    listProjects.forEach(function (project) {
        options.append('option').attr('value', project.id).text(`${project.lab_title} -> ${project.title}`);
    });
    options.on("change", () => {
        let selectedProject = d3.select("#projects-list").property('value');
        localStorage.setItem("selectedProject", selectedProject);
        console.log(selectedProject);
        updateMapList(selectedProject);
        d3.select("#project-link").attr("href", `https://app.strateegia.digital/journey/${selectedProject}`);
    });

    localStorage.setItem("selectedProject", listProjects[0].id);
    d3.select("#project-link").attr("href", `https://app.strateegia.digital/journey/${listProjects[0].id}`);
    updateMapList(listProjects[0].id);
}

function updateMapList(selectedProject) {
    users = [];
    getProjectById(accessToken, selectedProject).then(project => {
        console.log("getProjectById()");
        console.log(project);
        project.users.forEach(user => {
            users.push({ id: user.id, name: user.name });
        });
        console.log("project.maps");
        console.log(project.maps);
        let options = d3.select("#maps-list")
            .on("change", () => {
                // Print the selected map id
                let selectedMap = d3.select("#maps-list").property('value');
                localStorage.setItem("selectedMap", selectedMap);
                aggregateToolQuestions(selectedMap);
                console.log(selectedMap);
            })
            .selectAll("option")
            .data(project.maps, d => d.id);
        options.enter()
            .append("option")
            .attr("value", (d) => { return d.id })
            .text((d) => { return d.title });
        options.append("option")
            .attr("value", (d) => { return d.id })
            .text((d) => { return d.title });
        options.exit().remove();
        localStorage.setItem("selectedMap", project.maps[0].id);
        // updateToolList(project.maps[0].id);
        aggregateToolQuestions(project.maps[0].id);
    });
}

function aggregateToolQuestions(mapId) {
    getAllDivergencePointsByMapId(accessToken, mapId).then(map => {
        map.content.forEach(divergencePoint => {
            buildDivergencePointStructure(divergencePoint.id);
        })
    });
}

function updateToolList(selectedMap) {
    getAllDivergencePointsByMapId(accessToken, selectedMap).then(map => {
        console.log("getAllDivergencePointsByMapId()");
        console.log(map);
        /* 
           Remember that the kit Id is the generic kit! 
           The content Id is the instance of that kit in the map
           In this function, we are only interested in the instance of the kit
         */

        let options = d3.select("#tools-list")
            .on("change", () => {
                // Print the selected kit id
                let selected_kit = d3.select("#tools-list").property("value");
                setSelectedTool(selected_kit);
            })
            .selectAll("option")
            .data(map.content, d => d.id);
        options.enter()
            .append("option")
            .attr("value", (d) => { return d.id })
            .text((d) => { return d.tool.title });
        options.append("option")
            .attr("value", (d) => { return d.id })
            .text((d) => { return d.tool.title });
        options.exit().remove();
        let initialSelectedTool = map.content[0].id;
        setSelectedTool(initialSelectedTool);
    });
}

function setSelectedTool(toolId) {
    localStorage.setItem("selectedTool", toolId);
    buildDivergencePointStructure(localStorage.getItem("selectedTool"));
}

function buildDivergencePointStructure_(divergencePointId) {
    questions = [];
    getDivergencePointById(accessToken, divergencePointId).then(divergencePoint => {
        console.log("getDivergencePointById()");
        console.log(divergencePoint);
        divergencePoint.tool.questions.forEach(question => {
            questions.push({ id: question.id, question: question.question });
        });
    }).then(() => {
        buildComments(divergencePointId);
    });
}

async function buildDivergencePointStructure(divergencePointId) {
    questions = [];
    const divergencePoint = await getDivergencePointById(accessToken, divergencePointId);
    console.log("getDivergencePointById()");
    console.log(divergencePoint);
    divergencePoint.tool.questions.forEach(question => {
        questions.push({ id: question.id, question: question.question, kit: divergencePoint.tool.title, kit_row: divergencePoint.position.row, kit_col: divergencePoint.position.col });
    });
    buildComments(divergencePointId);
}

function buildComments(divergencePointId) {
    preRows = [];
    let fetches = [];
    questions.forEach(question => {
        fetches.push(getParentComments(accessToken, divergencePointId, question.id).then(comments => {
            console.log("teste");
            console.log(comments.content);
            comments.content.forEach(comment => {
                let question_text = questions.find(q => q.id == comment.question_id).question;
                let row = {
                    "id": comment.id,
                    "question_id": comment.question_id,
                    "question": question_text,
                    "author_id": comment.author.id,
                    "author": comment.author.name,
                    "comment": comment.text,
                    "kit_title": question_text.kit,
                };
                //row[question_text] = comment.text;
                preRows.push(row);
            });
        }));
    });
    Promise.all(fetches).then(() => {
        postRows = [];
        console.log("Promises finished.");
        console.log(preRows);
        users.forEach(user => {
            questions.forEach(question => {
                let foundRow = preRows.find(row => row.author_id == user.id && row.question_id == question.id);
                if (foundRow != undefined) {
                    let currentD = postRows.find(d => d.author == user.name);
                    if (currentD == undefined) {
                        const newLocal = {
                            "id": foundRow.id,
                            "author": user.name,
                        };
                        newLocal[question.question] = { comment: foundRow.comment, kit_title: question.kit_title };
                        postRows.push(newLocal);
                    } else {
                        currentD[question.question] = { comment: foundRow.comment, kit_title: question.kit_title };
                    }
                }
            });
        });
        let random_part = Math.floor(Math.random() * postRows.length);
        questions.sort((a, b) => {
            if (a.kit_row < b.kit_row) {
                return -1;
            }
            if (a.kit_row > b.kit_row) {
                return 1;
            }
            if (a.kit_col < b.kit_col) {
                return -1;
            }
            if (a.kit_col > b.kit_col) {
                return 1;
            }
            return 0;
        });
        let columns = [{ supertitle: "author", title: "author" }].concat(questions.map(q => { return { supertitle: q.kit, title: q.question } }));
        // columns = columns.map(c => {
        //     // const newId = `${c}_${random_part}`;
        //     const newId = `${c}`;
        //     return { "id": newId, "label": c }
        // });
        // columnsGlobal = columns;
        table = tabulate(postRows, columns);
    });
}

function tabulate(data, columns) {
    let table = d3.select('#table-body');
    //add class to table
    table.attr('class', 'table table-striped table-bordered table-hover table-sm');
    let thead = table.select('thead')
    let tbody = table.select('tbody');

    tbody.selectAll('tr').remove();
    tbody.selectAll('td').remove();
    thead.selectAll('tr').remove();
    thead.selectAll('th').remove();

    let widthDivision = Math.floor(100 / columns.length);

    let header = thead.append('tr');
    columns.forEach(column => {
        if (column.supertitle !== "author") {
            header.append('th').text(column.supertitle).attr('style', `width: ${widthDivision}%`);
        } else {
            header.append('th').text("kit → ").attr("class", "text-center").attr('style', `width: ${widthDivision}%`);;
        }
    });

    header = thead.append('tr');
    columns.forEach(column => {
        header.append('th').text(column.title).attr('style', `width: ${widthDivision}%`);;
    });

    data.forEach(function (row) {
        let tr = tbody.append('tr');
        //make all tr the same size
        // tr.attr('style', 'width:50px;height:50px');
        columns.forEach(function (column) {
            if (column.title == "author") {
                tr.append('td').text(row[column.title]).attr('style', `width: ${widthDivision}%`);;
            } else {
                if (row[column.title] != undefined) {
                    tr.append('td').text(row[column.title].comment).attr('style', `width: ${widthDivision}%`);;
                } else {
                    tr.append('td').text("").attr('style', `width: ${widthDivision}%`);;
                }
            }
        });
    });

    return table;


    // let table = d3.select('#my-table');
    // let thead = d3.select('#my-table').select('thead');
    // let tbody = d3.select('#my-table').select('tbody');

    // let thread_th = thead.selectAll('th')
    //     .data(columns, d => d.id);
    // thread_th
    //     .enter()
    //     .append('th')
    //     .text(d => d.label);
    // thread_th
    //     .append('th')
    //     .text(d => d.label);
    // thread_th.exit().remove();

    // // create a row for each object in the data
    // let rows_1 = tbody.selectAll('tr')
    //     .data(output_rows, d => d.id);
    // // #tocheck: why rows_2???
    // let rows_2 = rows_1.enter()
    //     .append('tr');
    // rows_1.append('tr');
    // rows_1.exit().remove();

    // //create a cell with author's comment to the corresponding question column
    // let cells_ = rows_2.selectAll('td')
    //     .data(function (row) {
    //         let columnsMap = columns.map(function (column) {
    //             let randomPart = Math.floor(Math.random() * 100000);
    //             let newId = `${row["id"]}_${randomPart}`;
    //             return { id: newId, column: column.label, value: row[column.label] };
    //         });
    //         console.log(columnsMap);
    //         return columnsMap;
    //     }, d => d.id);
    // cells_.enter()
    //     .append('td')
    //     .text(function (d) { return d.value; });
    // cells_
    //     .append('td')
    //     .text(function (d) { return d.value; });
    // cells_.exit().remove();

    // return table;
}