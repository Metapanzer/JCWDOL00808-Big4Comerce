import { Box, Heading, Text } from "@chakra-ui/react";
import Axios from "axios";
import { useState } from "react";
import { useEffect } from "react";

export default function Dashboard() {
  const token = localStorage.getItem("token");
  const [data, setData] = useState([]);

  const dashboardData = () => {
    Axios.get(`${process.env.REACT_APP_API_BASE_URL}/admins/dashboardData`, {
      headers: { Authorization: token },
    })
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    dashboardData();
  }, []);

  return (
    <Box textAlign="center" py={10} px={6} minH={"18.5rem"} w={"full"}>
      <Heading
        display="inline-block"
        as="h2"
        size="2xl"
        bgGradient="linear(to-r, teal.400, teal.600)"
        backgroundClip="text"
      >
        Big4Commerce.com
      </Heading>
      <Text fontSize="18px" mt={5} mb={2}>
        Dashboard Page
      </Text>
    </Box>
  );
}
