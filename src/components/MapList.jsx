import { useState, useEffect } from 'react';
import { Select } from '@chakra-ui/react';
import * as api from 'strateegia-api';

export default function MapList({ projectId, handleSelectChange }) {
  const [mapList, setMapList] = useState(null);

  useEffect(() => {
    async function fetchMapList() {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const project = await api.getProjectById(accessToken, projectId);
        console.log('project: %o', project);
        // console.log('projectList: %o', projectList);
        setMapList(project.maps);
      } catch (error) {
        console.log(error);
      }
    }
    fetchMapList();
  }, [projectId]);

  return projectId ? (
    <Select placeholder="escolha o mapa" onChange={handleSelectChange}>
      {mapList
        ? mapList.map(mapItem => {
            return (
              <option key={mapItem.id} value={mapItem.id}>
                {mapItem.title}
              </option>
            );
          })
        : null}
    </Select>
  ) : (
    ''
  );
}
