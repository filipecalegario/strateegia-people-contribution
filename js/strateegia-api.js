/*
    Partial implementation of strateegia-api
*/


const API_URL = 'https://api.strateegia.digital/projects/v1/';
const API_USERS_URL = 'https://api.strateegia.digital/users/v1/';

async function getAllProjects(token){

    const response = await fetch(`${API_URL}project?size=5000`, {
        method: 'get',
        headers: {
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();

    return data;    
}

async function getProjectById(token, project_id){

    const response = await fetch(`${API_URL}project/${project_id}`, {
        method: 'get',
        headers: {
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();

    return data;    
}

async function getAllContentsByMissionId(token, map_id){

    const response = await fetch(`${API_URL}mission/${map_id}/content?size=5000`, {
        method: 'get',
        headers: {
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();

    return data;    
}

async function getContentById(token, content_id){

    const response = await fetch(`${API_URL}content/${content_id}`, {
        method: 'get',
        headers: {
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();

    return data;    
}

async function getMapById(token, map_id){

    const response = await fetch(`${API_URL}map/${map_id}`, {
        method: 'get',
        headers: {
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();

    return data;    
}

async function getParentComments(token, content_id, question_id){

    const response = await fetch(`${API_URL}content/${content_id}/question/${question_id}/comment?size=5000`, {
        method: 'get',
        headers: {
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();

    return data;    
}

async function getCommentsGroupedByQuestionReport(token, content_id){

    const response = await fetch(`${API_URL}content/${content_id}/comment/report?size=5000`, {
        method: 'get',
        headers: {
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();

    return data;    
}

async function getUser(token){

    const response = await fetch(`${API_USERS_URL}user/me`, {
        method: 'get',
        headers: {
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();

    return data;    
}