import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Image,
  Stack,
  Heading,
  Text,
  Divider,
  Button,
  ButtonGroup,
  Input,
  InputGroup,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Select,
  Spinner,
  useDisclosure,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Box,
} from "@chakra-ui/react";
import { BiArrowBack } from "react-icons/bi";
import { useState, useEffect } from "react";
import Axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import React from "react";
import * as yup from "yup";
import { useFormik } from "formik";

const WarehouseDetails = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [cityData, setCityData] = React.useState([]);
  const [provinceData, setProvinceData] = React.useState([]);
  const [district, setDistrict] = React.useState("");

  const [detailsName, setDetailsName] = useState("");
  const [detailsAddress, setDetailsAddress] = useState("");
  const [detailsCity, setDetailsCity] = useState("");
  const [detailsProvince, setDetailsProvince] = useState("");
  const [detailsDistrict, setDetailsDistrict] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [adminAssigned, setAdminAssigned] = useState("");

  const toast = useToast();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const cancelRef = React.useRef();

  const navigate = useNavigate();

  const { search } = useLocation();
  const id = search.split("=")[1];

  const getSpecificWarehouse = () => {
    Axios.get(`${process.env.REACT_APP_API_BASE_URL}/warehouses/getWarehouseDetails?id=${id}`)
      .then((response) => {
        setTimeout(() => {
          setName(response.data.data[0].name);
          setAddress(response.data.data[0].address);
          setCity(response.data.data[0].city);
          setProvince(response.data.data[0].province);
          setDistrict(response.data.data[0].district);
          setAdminAssigned(response.data.adminAssigned[0].full_name);

          setDetailsName(response.data.data[0].name);
          setDetailsAddress(response.data.data[0].address);
          setDetailsProvince(response.data.data[0].province);
          setDetailsCity(response.data.data[0].city);
          setDetailsDistrict(response.data.data[0].district);
          setIsLoading(false);
        }, 1000);
      })
      .catch((error) => {
        setIsLoading(false);
        console.log(error);
      });
  };

  const getProvinceData = () => {
    Axios.get(`${process.env.REACT_APP_API_BASE_URL}/warehouses/getProvinceData`)
      .then((response) => {
        setProvinceData(response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const onGetCity = (province_id) => {
    Axios.get(`${process.env.REACT_APP_API_BASE_URL}/warehouses/getCityData?province_id=${province_id}`)
      .then((response) => {
        setCityData(response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const buttonEditWarehouse = (values) => {
    Axios.post(`${process.env.REACT_APP_API_BASE_URL}/warehouses/updateWarehouseData`, {
      id,
      ...values,
    })
      .then((response) => {
        toast({
          title: `${response.data.message}`,
          status: "success",
          duration: 1000,
          isClosable: true,
          onCloseComplete: () => getSpecificWarehouse(),
        });
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getSpecificWarehouse();
    getProvinceData();
  }, []);

  const deleteButton = () => {
    Axios.delete(`${process.env.REACT_APP_API_BASE_URL}/warehouses/deleteWarehouseData?id=${id}`)
      .then((response) => {
        toast({
          title: `${response.data.message}`,
          status: "success",
          duration: 1000,
          isClosable: true,
          onCloseComplete: () => navigate("/warehouse/list"),
        });
      })
      .catch((err) => console.log(err));
  };

  const formik = useFormik({
    initialValues: {
      name: detailsName,
      address: detailsAddress,
      province: detailsProvince,
      city: detailsCity,
      district: detailsDistrict,
    },
    validationSchema: yup.object().shape({
      name: yup.string().required("Required"),
      address: yup.string().required("Required"),
      province: yup.string().required("Required"),
      city: yup.string().required("Required"),
      district: yup.string().required("Required"),
    }),
    onSubmit: (values, actions) => {
      buttonEditWarehouse(values);
      onEditClose();
    },
  });

  return (
    <div className="flex flex-col items-center w-full">
      <Box w={[300, 400, 500]}>
        {isLoading ? (
          <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" mt="250px" />
        ) : (
          <Card maxW="lg" border="1px" borderColor="gray.300">
            <CardBody>
              <Image src="https://www.paper.id/blog/wp-content/uploads/2022/11/istockphoto-1138429558-612x612-1.jpg" alt="Green double couch with wooden legs" borderRadius="lg" />
              <Stack mt="6" spacing="3">
                <Heading size="md">Warehouse name: {name}</Heading>
                <Text size="sm">Admin: {adminAssigned}</Text>
                <Text size="sm">Address: {address}</Text>
                <Text color="blue.600" size="sm">
                  {city}, {province}
                </Text>
              </Stack>
            </CardBody>
            <Divider />
            <CardFooter>
              <ButtonGroup spacing="6">
                <Button variant="solid" onClick={() => navigate("/warehouse/list", { replace: true })}>
                  <BiArrowBack />
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={() => {
                    onEditOpen();
                  }}
                >
                  Edit
                </Button>
                <Button
                  colorScheme="red"
                  onClick={() => {
                    onAlertOpen();
                  }}
                >
                  Delete
                </Button>
                <AlertDialog isOpen={isAlertOpen} leastDestructiveRef={cancelRef} onClose={onAlertClose}>
                  <AlertDialogOverlay>
                    <AlertDialogContent>
                      <AlertDialogHeader fontSize="lg" fontWeight="bold">
                        Delete Warehouse
                      </AlertDialogHeader>

                      <AlertDialogBody>Are you sure you want to delete this data? This can't be undone.</AlertDialogBody>

                      <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onAlertClose}>
                          Cancel
                        </Button>
                        <Button colorScheme="red" onClick={deleteButton} ml={3}>
                          Delete
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialogOverlay>
                </AlertDialog>
                <Modal isOpen={isEditOpen} onClose={onEditClose}>
                  <ModalOverlay />
                  <ModalContent>
                    <ModalHeader>Edit warehouse data</ModalHeader>
                    <ModalCloseButton />

                    <form onSubmit={formik.handleSubmit}>
                      <ModalBody>
                        <FormControl isInvalid={formik.errors.name && formik.touched.name}>
                          <FormLabel>Name:</FormLabel>
                          <Input id="name" placeholder={detailsName} value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                          <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
                        </FormControl>
                        <FormControl isInvalid={formik.errors.address && formik.touched.address}>
                          <FormLabel>Address:</FormLabel>
                          <InputGroup>
                            <Input id="address" placeholder={detailsAddress} value={formik.values.address} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                          </InputGroup>
                          <FormErrorMessage>{formik.errors.address}</FormErrorMessage>
                        </FormControl>
                        <FormControl isInvalid={formik.errors.province && formik.touched.province}>
                          <FormLabel>Province:</FormLabel>
                          <Select
                            id="province"
                            placeholder="Select province"
                            onChange={(e) => {
                              formik.setFieldValue("province", e.target.value.split(",")[1]);
                              onGetCity(e.target.value.split(",")[0]);
                            }}
                            onBlur={formik.handleBlur}
                          >
                            {provinceData.map((value) => {
                              return (
                                <option id="province" value={value.province_id + "," + value.province} key={value.province_id}>
                                  {value.province}
                                </option>
                              );
                            })}
                          </Select>
                          <FormErrorMessage>{formik.errors.province}</FormErrorMessage>
                        </FormControl>
                        <FormControl isInvalid={formik.errors.city && formik.touched.city}>
                          <FormLabel>City:</FormLabel>
                          <Select id="city" placeholder="Select city" onChange={formik.handleChange} onBlur={formik.handleBlur}>
                            {cityData.map((value) => {
                              return (
                                <option id="city" value={`${value.type} ${value.city_name}`} key={value.city_id}>
                                  {value.type} {value.city_name}
                                </option>
                              );
                            })}
                          </Select>

                          <FormErrorMessage>{formik.errors.city}</FormErrorMessage>
                        </FormControl>
                        <FormControl isInvalid={formik.errors.district && formik.touched.district}>
                          <FormLabel>District (Kecamatan):</FormLabel>
                          <InputGroup>
                            <Input id="district" placeholder={detailsDistrict} value={formik.values.district} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                          </InputGroup>
                          <FormErrorMessage>{formik.errors.district}</FormErrorMessage>
                        </FormControl>
                      </ModalBody>

                      <ModalFooter>
                        <Button mr={3} onClick={onEditClose}>
                          Close
                        </Button>
                        <Button colorScheme="blue" type="submit">
                          Save
                        </Button>
                      </ModalFooter>
                    </form>
                  </ModalContent>
                </Modal>
              </ButtonGroup>
            </CardFooter>
          </Card>
        )}
      </Box>
    </div>
  );
};

export default WarehouseDetails;
