let users = [];
let questions = [];
let preRows = [];
let postRows = [];

function initializeProjectList() {
    getAllProjects(accessToken).then(labs => {
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
                console.log(`${currentLab.lab.name} -> ${project.title}`);
                const newProject = {
                    "id": project.id,
                    "title": project.title,
                    "lab_id": currentLab.lab.id,
                    "lab_title": currentLab.lab.name
                };
                listProjects.push(newProject);
            }
        }
        // Using d3 to create the list of projects
        let options = d3.select("#projects-list")
            .on("change", () => {
                // Print the selected project id
                let selectedProject = d3.select("#projects-list").property('value');
                localStorage.setItem("selectedProject", selectedProject);
                updateMapList(selectedProject);
                console.log(selectedProject);
            })
            .selectAll("option")
            .data(listProjects, d => d.id);
        options.enter()
            .append("option")
            .attr("value", (d) => { return d.id })
            .text((d) => { return `${d.lab_title} -> ${d.title}` });
        options.append("option")
            .attr("value", (d) => { return d.id })
            .text((d) => { return `${d.lab_title} -> ${d.title}` });
        options.exit().remove();
        localStorage.setItem("selectedProject", listProjects[0].id);
        updateMapList(listProjects[0].id);
    });
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
                updateToolList(selectedMap);
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
        updateToolList(project.maps[0].id);
    });
}

function updateToolList(selectedMap) {
    getAllDivergencePointsByMapId(accessToken, selectedMap).then(map => {
        console.log("getAllContentsByMapId()");
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

function buildDivergencePointStructure(divergencePointId) {
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
                        newLocal[question.question] = foundRow.comment;
                        postRows.push(newLocal);
                    } else {
                        currentD[question.question] = foundRow.comment;
                    }
                }
            });
        });
        let random_part = Math.floor(Math.random() * postRows.length);
        let columns = ["author"].concat(questions.map(q => q.question));
        columns = columns.map(c => {
            // const newId = `${c}_${random_part}`;
            const newId = `${c}`;
            return { "id": newId, "label": c }
        });
        tabulate(postRows, columns);
    });
}

function tabulate(output_rows, columns) {
    let table = d3.select('#my-table');
    let thead = d3.select('#my-table').select('thead');
    let tbody = d3.select('#my-table').select('tbody');

    let thread_th = thead.selectAll('th')
        .data(columns, d => d.id);
    thread_th
        .enter()
        .append('th')
        .text(d => d.label);
    thread_th
        .append('th')
        .text(d => d.label);
    thread_th.exit().remove();

    // create a row for each object in the data
    let rows_1 = tbody.selectAll('tr')
        .data(output_rows, d => d.id);
    let rows_2 = rows_1.enter()
        .append('tr');
    rows_1.append('tr');
    rows_1.exit().remove();

    //create a cell with author's comment to the corresponding question column
    let cells_ = rows_2.selectAll('td')
        .data(function (row) {
            let columnsMap = columns.map(function (column) {
                let randomPart = Math.floor(Math.random()*100000);
                let newId = `${row["id"]}_${randomPart}`;
                return { id: newId, column: column.label, value: row[column.label] };
            });
            console.log(columnsMap);
            return columnsMap;
        }, d => d.id);
    cells_.enter()
        .append('td')
        .text(function (d) { return d.value; });
    cells_
        .append('td')
        .text(function (d) { return d.value; });
    cells_.exit().remove();

    return table;
}