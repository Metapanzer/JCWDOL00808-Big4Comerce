import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Input,
  VStack,
  Button,
  HStack,
  Text,
  Flex,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useToast,
  Tooltip,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, AddIcon } from "@chakra-ui/icons";
import axios from "axios";
import { Link } from "react-router-dom";

const UserAddress = () => {
  const token = localStorage.getItem("user_token");
  const [addresses, setAddresses] = useState([]);
  const toast = useToast();

  // nampung hasil get dari raja ongkir
  const [provinceData, setProvinceData] = useState([]);
  const [cityData, setCityData] = useState([]);

  //modal delete address
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [addressToDelete, setAddressToDelete] = React.useState(null);

  const handleDeleteButtonClick = (addressId) => {
    setAddressToDelete(addressId);
    onOpen();
  };

  // search state
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (token) {
      fetchAddresses();
    }
    // getProvinceData();
  }, [searchTerm]);

  const handleConfirmDelete = async () => {
    await handleDeleteAddress(addressToDelete);
    setAddressToDelete(null);
    onClose();
  };

  const fetchAddresses = async () => {
    try {
      // Replace with your API endpoint to get all addresses
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/address/get-address?search_query=${searchTerm}`,
        {
          headers: { Authorization: token },
        }
      );
      setAddresses(response.data.result);
    } catch (error) {
      toast({
        title: "Error fetching addresses.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      // Replace with your API endpoint to delete an address
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/address/delete-address/${id}`
      );
      toast({
        title: "Address deleted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchAddresses();
    } catch (error) {
      toast({
        title: "Error deleting address.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <Box minH={"70vh"} mb={4} w={"full"}>
        <Heading fontFamily="Oswald" mb={10} mt={10}>
          Address List
        </Heading>
        <HStack mb={4} mt={2} mr={4} justify="center">
          <Input
            fontFamily="Roboto"
            type="text"
            borderRadius={0}
            placeholder="Search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            maxW="200px"
          />
          {/* <IconButton icon={<SearchIcon />} aria-label="Search" colorScheme="blue" /> */}
          <Tooltip label="Add Address" placement="top-start">
            <Link to="/user/add-address">
              <IconButton
                variant="buttonBlack"
                icon={<AddIcon />}
                aria-label="Add Address"
                colorScheme="blue"
              />
            </Link>
          </Tooltip>
        </HStack>
        <VStack mt={8} w={"70vw"} spacing={4} mx={"auto"} justify="center">
          {addresses.map((address) => (
            <Tooltip
              label={address.is_primary === true ? "Primary Address" : ""}
              isDisabled={address.is_primary !== true}
              placement="top-start"
            >
              <Box
                key={address.id}
                borderWidth={address.is_primary === true ? "5px" : "1px"}
                borderColor={
                  address.is_primary === true ? "blue.800" : "gray.200"
                }
                borderRadius="0"
                p={4}
                w="100%"
                fontFamily="Roboto"
              >
                <Text fontFamily="Oswald" fontSize="lg">
                  {address.recipient}
                </Text>
                <Text>{address.phone_number}</Text>
                <Text>
                  {address.address}, {address.district}, {address.city},{" "}
                  {address.province}, {address.postal_code}
                </Text>
                <Flex justify="flex-end" mt={4}>
                  <Link to={`/user/address/${address.id}`}>
                    <Button
                      // onClick={() => handleEditAddress(address.id, formik.values)}
                      icon={<EditIcon />}
                      variant="buttonBlack"
                      aria-label="Edit Address"
                      borderRadius={0}
                      mr={2}
                    >
                      Edit
                    </Button>
                  </Link>
                  <IconButton
                    onClick={() => handleDeleteButtonClick(address.id)}
                    icon={<DeleteIcon />}
                    colorScheme="red"
                    aria-label="Delete Address"
                    borderRadius={0}
                  />
                </Flex>
              </Box>
            </Tooltip>
          ))}
        </VStack>
      </Box>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontFamily="Oswald">Delete Address</ModalHeader>
          <ModalCloseButton />
          <ModalBody fontFamily="Roboto">
            Are you sure you want to delete this address? This action cannot be
            undone.
          </ModalBody>

          <ModalFooter>
            <Button variant="buttonBlack" mr={3} onClick={handleConfirmDelete}>
              Delete
            </Button>
            <Button variant="buttonWhite" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UserAddress;
