import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  useToast,
  useDisclosure,
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
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
  VStack,
  Spinner,
} from "@chakra-ui/react";
import { Card, CardBody, Box, Text } from "@chakra-ui/react";

import Axios from "axios";
import { useEffect, useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { useFormik } from "formik";
import * as yup from "yup";

const WarehouseList = () => {
  const toast = useToast();

  const navigate = useNavigate();
  const [role, setRole] = useState(localStorage.getItem("role"));

  const {
    isOpen: isAlertOpen,
    onOpen: onAlertOpen,
    onClose: onAlertClose,
  } = useDisclosure();
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const [warehouseData, setWarehouseData] = useState([]);
  const [warehouseId, setWarehouseId] = useState();

  const [sort, setSort] = useState("id");
  const [order, setOrder] = useState("ASC");
  const [search, setSearch] = useState("");
  const [keyword, setKeyword] = useState("");

  const [page, setPage] = useState(0);
  const [totalPage, setTotalPage] = useState(0);

  const [name, setName] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [provinceData, setProvinceData] = React.useState([]);
  const [province, setProvince] = React.useState("");
  const [cityData, setCityData] = React.useState([]);
  const [city, setCity] = React.useState("");
  const [districtData, setDistrictData] = React.useState([]);
  const [district, setDistrict] = React.useState("");
  const [loading, setLoading] = useState(true);

  const getWarehouseData = () => {
    Axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/warehouses/getWarehouseData?page=${page}&sort=${sort}&order=${order}&keyword=${keyword}`
    )
      .then((response) => {
        setTotalPage(response.data.totalPage);
        setWarehouseData(response.data.rows);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    getWarehouseData();
  }, [page, sort, order, keyword]);

  const showWarehouseData = () => {
    let count = 0;
    return warehouseData.map((value) => {
      count++;
      return (
        <Tr key={value.id}>
          <Td>{count}</Td>
          <Td>{value.name}</Td>
          <Td>{value.address}</Td>
          <Td>{value.province}</Td>
          <Td>{value.city}</Td>
          <Td isNumeric>
            {role === "1" && (
              <Button
                colorScheme="yellow"
                className="mr-2"
                onClick={() => navigate(`/warehouse/stock/${value.id}`)}
              >
                Stock
              </Button>
            )}
            <Button
              colorScheme="teal"
              className="mr-2"
              onClick={() => {
                setWarehouseId(value.id);
                navigate(`/warehouse/details?id=${value.id}`);
              }}
            >
              Details
            </Button>
          </Td>
        </Tr>
      );
    });
  };

  const handlePageClick = (data) => {
    setPage(data.selected);
  };

  const handleSearchButton = () => {
    setPage(0);
    setKeyword(search);
  };

  const getProvinceData = () => {
    Axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/warehouses/getProvinceData`
    )
      .then((response) => {
        setProvinceData(response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getProvinceData();
  }, []);

  const onGetCity = (province_id) => {
    Axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/warehouses/getCityData?province_id=${province_id}`
    )
      .then((response) => {
        setCityData(response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const buttonAddWarehouse = (values) => {
    Axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/warehouses/addWarehouse`,
      values
    )
      .then((response) => {
        toast({
          title: `${response.data.message}`,
          status: "success",
          duration: 9000,
          isClosable: true,
          onCloseComplete: () => getWarehouseData(),
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      address: "",
      province: "",
      city: "",
      district: "",
    },
    validationSchema: yup.object().shape({
      name: yup.string().required("Required"),
      address: yup.string().required("Required"),
      province: yup.string().required("Required"),
      city: yup.string().required("Required"),
      district: yup.string().required("Required"),
    }),
    onSubmit: (values, actions) => {
      buttonAddWarehouse(values);
      onAddClose();
    },
  });

  return (
    <>
      <div className="flex flex-col items-center w-full">
        <Box className="my-5">
          <Flex id="sort, search, and filter">
            <Card maxW="lg">
              <CardBody>
                <FormControl>
                  <FormLabel>Search</FormLabel>
                  <Input
                    placeholder="warehouse name, city, or province..."
                    className="mb-5"
                    onChange={(element) => setSearch(element.target.value)}
                  />
                  <Button onClick={handleSearchButton}>Search</Button>
                </FormControl>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <FormControl>
                  <FormLabel>Sort data by:</FormLabel>
                  <VStack>
                    <Select
                      placeholder="Select option"
                      onChange={(element) => setSort(element.target.value)}
                    >
                      <option value="name">Warehouse name</option>
                      <option value="province">Province</option>
                      <option value="city">City</option>
                      <option value="updatedAt">Date added</option>
                    </Select>
                    <Select
                      placeholder="Order"
                      onChange={(element) => setOrder(element.target.value)}
                    >
                      <option value="ASC">Ascending</option>
                      <option value="DESC">Descending</option>
                    </Select>
                  </VStack>
                </FormControl>
              </CardBody>
            </Card>
          </Flex>
        </Box>

        {loading ? (
          <Spinner />
        ) : warehouseData.length !== 0 && !loading ? (
          <Card>
            <CardBody>
              <TableContainer className="my-5">
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>No.</Th>
                      <Th>Warehouse Name</Th>
                      <Th>Address</Th>
                      <Th>Province</Th>
                      <Th>City</Th>
                      <Th isNumeric className="mr-5">
                        Action
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>{showWarehouseData()}</Tbody>
                </Table>
              </TableContainer>
            </CardBody>
          </Card>
        ) : (
          <Text as="b" fontSize="3xl">
            Warehouse data is currently unavailable
          </Text>
        )}

        <div id="pagination" className="mt-5 flex items-center justify-center">
          <ReactPaginate
            previousLabel={"< Previous"}
            nextLabel={"Next >"}
            breakLabel={"..."}
            pageCount={totalPage}
            marginPagesDisplayed={2}
            pageRangeDisplayed={2}
            onPageChange={handlePageClick}
            containerClassName={"flex"}
            pageClassName={"page-item"}
            pageLinkClassName={
              "mx-2 bg-gray-200 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            }
            previousLinkClassName={
              "mx-2 bg-gray-200 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            }
            nextLinkClassName={
              "mx-2 bg-gray-200 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            }
          />
        </div>
        <Button
          size="md"
          colorScheme="orange"
          className="my-5"
          onClick={onAddOpen}
        >
          Add new warehouse
        </Button>
        <Modal isOpen={isAddOpen} onClose={onAddClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add new warehouse</ModalHeader>
            <ModalCloseButton />
            <form onSubmit={formik.handleSubmit}>
              <ModalBody>
                <FormControl
                  isInvalid={formik.errors.name && formik.touched.name}
                >
                  <FormLabel>Name:</FormLabel>
                  <Input
                    id="name"
                    placeholder="Warehouse name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
                </FormControl>
                <FormControl
                  isInvalid={formik.errors.address && formik.touched.address}
                >
                  <FormLabel>Address:</FormLabel>
                  <InputGroup>
                    <Input
                      id="address"
                      placeholder="Address"
                      value={formik.values.address}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </InputGroup>
                  <FormErrorMessage>{formik.errors.address}</FormErrorMessage>
                </FormControl>
                <FormControl
                  isInvalid={formik.errors.province && formik.touched.province}
                >
                  <FormLabel>Province:</FormLabel>
                  <Select
                    id="province"
                    placeholder="Select province"
                    onChange={(e) => {
                      formik.setFieldValue(
                        "province",
                        e.target.value.split(",")[1]
                      );

                      onGetCity(e.target.value.split(",")[0]);
                    }}
                    onBlur={formik.handleBlur}
                  >
                    {provinceData.map((value) => {
                      return (
                        <option
                          id="province"
                          value={value.province_id + "," + value.province}
                          key={value.province_id}
                        >
                          {value.province}
                        </option>
                      );
                    })}
                  </Select>
                  <FormErrorMessage>{formik.errors.province}</FormErrorMessage>
                </FormControl>
                <FormControl
                  isInvalid={formik.errors.city && formik.touched.city}
                >
                  <FormLabel>City:</FormLabel>
                  <Select
                    id="city"
                    placeholder="Select city"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    {cityData.map((value) => {
                      return (
                        <option
                          id="city"
                          value={`${value.type} ${value.city_name}`}
                          key={value.city_id}
                        >
                          {value.type} {value.city_name}
                        </option>
                      );
                    })}
                  </Select>
                  <FormErrorMessage>{formik.errors.city}</FormErrorMessage>
                </FormControl>
                <FormControl
                  isInvalid={formik.errors.district && formik.touched.district}
                >
                  <FormLabel>District (Kecamatan):</FormLabel>
                  <InputGroup>
                    <Input
                      id="district"
                      placeholder="District"
                      value={formik.values.district}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </InputGroup>
                  <FormErrorMessage>{formik.errors.district}</FormErrorMessage>
                </FormControl>
              </ModalBody>

              <ModalFooter>
                <Button colorScheme="red" mr={3} onClick={onAddClose}>
                  Close
                </Button>
                <Button colorScheme="blue" type="submit">
                  Add warehouse data
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>
      </div>
    </>
  );
};

export default WarehouseList;
