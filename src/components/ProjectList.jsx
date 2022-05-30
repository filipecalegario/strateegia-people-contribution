import { useState, useEffect } from 'react';
import { Select } from '@chakra-ui/react';
import * as api from 'strateegia-api';

export default function ProjectList({ handleSelectChange }) {
  const [projectList, setProjectList] = useState([]);

  useEffect(() => {
    async function fetchProjectList() {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const projectList = await api.getAllProjects(accessToken);
        // console.log('projectList: %o', projectList);
        setProjectList(projectList);
      } catch (error) {
        console.log(error);
      }
    }
    fetchProjectList();
  }, []);

  return (
    <Select placeholder="escolha o projeto" onChange={handleSelectChange}>
      {projectList.map(lab => {
        return lab.projects.map(project => {
          return (
            <option key={project.id} value={project.id}>
              {lab.lab.name ? lab.lab.name : 'public'} - {project.title}
            </option>
          );
        });
      })}
    </Select>
  );
}
