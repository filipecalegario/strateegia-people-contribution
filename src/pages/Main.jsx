import { Box, Heading, Link, Text, UnorderedList } from "@chakra-ui/react";
import { MdArrowUpward } from "react-icons/md";
import { useEffect, useState } from "react";
import * as api from "strateegia-api";
import Loading from "../components/Loading";
import MapList from "../components/MapList";
import ProjectList from "../components/ProjectList";
import DivPointByMapId from "../components/DivPointByMapId";

export default function Main() {
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedMap, setSelectedMap] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [mapDetails, setMapDetails] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleSelectChange = (e) => {
    setSelectedProject(e.target.value);
  };

  const handleMapSelectChange = (e) => {
    setSelectedMap(e.target.value);
  };

  useEffect(() => {
    setMapDetails(null);
    setSelectedMap("");
  }, [selectedProject]);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const response = await api.getMapById(accessToken, selectedMap);
        setMapDetails({ ...response });
        console.log("mapDetails: %o", mapDetails);
        // [TODO] - use the access token to fetch the data
        // [TODO] - add the fetch data function here
      } catch (error) {
        console.log(error);
      }
      setIsLoading(false);
    }
    fetchData();
  }, [selectedMap]);

  useEffect(() => {
    setAccessToken(localStorage.getItem("accessToken"));
  }, []);

  const handleScroll = () => {
    const position = window.pageYOffset;
    setScrollPosition(position);
  };

  useEffect(() => {
      window.addEventListener('scroll', handleScroll, { passive: true });

      return () => {
          window.removeEventListener('scroll', handleScroll);
      };
  }, []);

  return (
    <Box padding={10} id='top'>

      <Heading as="h3" size="md" mb={3} >
        contribuições das pessoas
      </Heading>
      <ProjectList handleSelectChange={handleSelectChange} />
      <MapList
        projectId={selectedProject}
        handleSelectChange={handleMapSelectChange}
      />
      
      <Loading active={isLoading} />
      {mapDetails?.points ? (
        <Box mt={'25px'}>
          
          <DivPointByMapId mapId={selectedMap}/>
        </Box>
      ) : null}
      {scrollPosition > 500 && <Link href='#top'>
          <Box position='fixed'
              bottom='20px'
              right={['16px', '84px', '84px', '84px', '120px']}
              zIndex={2}
              cursor='pointer'
          >
            <MdArrowUpward size='30px'/>
          </Box>
      </Link>} 
    </Box>
  );
}
