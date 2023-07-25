import React, { useState, useEffect } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Box,
  HStack,
  VStack,
  IconButton,
  Heading,
  Input,
  Text,
  Tooltip,
  FormErrorMessage,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  useToast,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { CloseIcon, AddIcon } from "@chakra-ui/icons";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";

const WarehouseStock = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [warehouseName, setWarehouseName] = useState("");
  const [stocks, setStocks] = useState([]);
  const [stocksToUpdate, setStocksToUpdate] = useState([]);
  const [productsModal, setProductsModal] = useState([]);
  const [productsCategoryModal, setProductsCategoryModal] = useState([]);
  const [stockToDelete, setStockToDelete] = useState(null);
  const [stockToUpdate, setStockToUpdate] = useState(null);
  const toast = useToast();

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  const {
    isOpen: isEditStockOpen,
    onOpen: onEditStockOpen,
    onClose: onEditStockClose,
  } = useDisclosure();
  const {
    isOpen: isAddStockOpen,
    onOpen: onAddStockOpen,
    onClose: onAddStockClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteProductOpen,
    onOpen: onDeleteProductOpen,
    onClose: onDeleteProductClose,
  } = useDisclosure();

  const { id } = useParams();

  // Fetch products from the server (replace the URL with your API endpoint)
  useEffect(() => {
    fetchWarehouseProducts();
    getSpecificWarehouse();
    fetchCategoryProductsModal();
  }, [searchTerm]);

  // CONFIRM DELETE
  const handleConfirmDelete = async () => {
    await handleDeleteStock(stockToDelete);
    setStockToDelete(null);
    onDeleteProductClose();
  };
  //BUKA MODAL DELETE
  const handleDeleteModal = (stockId) => {
    // Handle deleting the product with the given ID
    setStockToDelete(stockId);
    onDeleteProductOpen();
  };

  //API DELETE STOCK
  const handleDeleteStock = async (id) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/warehouses//delete-warehouse-product/${id}`
      );
      toast({
        title: "Stock deleted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchWarehouseProducts();
    } catch (error) {
      toast({
        title: "Error deleting Stock.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  //API UPDATE STOCK
  const handleUpdateStock = async (id, values) => {
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_BASE_URL}/warehouses/update-stock-product/${id}`,
        {
          ...values,
          stock: parseInt(values.stock),
        }
      );

      setStocksToUpdate([...stocksToUpdate, response.data]);
      fetchWarehouseProducts();
      toast({
        title: "Stock updated.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.log(error);
      toast({
        title: error?.response?.data?.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    // Handle updating stock for the selected product
    onEditStockClose();
  };

  // CONFIRM UPDATE
  const handleConfirmUpdate = async () => {
    await handleUpdateStock(stockToUpdate, formikUpdate.values);
    setStockToUpdate(null);
    onEditStockClose();
  };

  // BUKA MODAL UPDATE
  const handleUpdateModal = async (stockId) => {
    // Handle updating the product with the given ID
    setStockToUpdate(stockId);
    onEditStockOpen();
  };

  // BUKA MODAL CREATE
  const handleCreateModal = () => {
    setSelectedProduct();
    onAddStockOpen();
  };

  //API CREATE STOCK
  const handleCreateStock = async (values, { setSubmitting, resetForm }) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/warehouses/add-warehouse-product/${id}`,
        values
      );

      setStocks([...stocks, response.data]);
      fetchWarehouseProducts();
      toast({
        title: "Stock added.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      resetForm();
    } catch (error) {
      console.log(error);
      toast({
        title: error?.response?.data?.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
    // const product = products.find((p) => p.id === id);
    // setSelectedProduct(product);
    // setSelectedProduct();
    fetchWarehouseProducts();
    onAddStockClose();
  };

  const getSpecificWarehouse = () => {
    axios
      .get(
        `${process.env.REACT_APP_API_BASE_URL}/warehouses/getWarehouseDetails/${id}`
      )
      .then((response) => {
        setWarehouseName(response.data.name);
      })
      .catch((error) => console.log(error));
  };

  const fetchWarehouseProducts = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/warehouses/get-warehouse-product/${id}?search_query=${searchTerm}&role=${userRole}`,
        { headers: { Authorization: token } }
      );
      setProducts(response?.data?.data);
    } catch (error) {
      toast({
        title: "Error fetching addresses.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  const fetchCategoryProductsModal = async () => {
    const response = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/productcategory/listproductcategory`
    );
    setProductsCategoryModal(response.data.result);
  };

  const fetchProductsModal = async (product_category_id) => {
    const response = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/product/listproductbycategory?search_query=${product_category_id}`
    );
    setProductsModal(response.data.result);
  };

  const formikAdd = useFormik({
    initialValues: {
      stock: "",
      products_id: "",
      product_category_id: "",
    },
    validationSchema: Yup.object({
      stock: Yup.number().required("Required"),
      products_id: Yup.string().required("Required"),
    }),
    onSubmit: handleCreateStock,
  });

  const formikUpdate = useFormik({
    initialValues: {
      stock: "",
      description: "",
    },
    validationSchema: Yup.object({
      stock: Yup.number().required("Required"),
      description: Yup.string().required("Required"),
    }),
    onSubmit: handleUpdateStock,
  });

  return (
    <>
      <Box width="100%" overflowX="auto">
        <HStack mb={4} mt={2} mr={4} justify="flex-end">
          {userRole !== "2" && (
            <Link to="/warehouse/list">
              <IconButton
                icon={<CloseIcon />}
                aria-label="Back Button"
                colorScheme="blue"
              />
            </Link>
          )}
        </HStack>
        <Heading>Stock List</Heading>
        <Text fontSize="xl" mb={10}>
          {" "}
          {warehouseName}
        </Text>
        <HStack mb={4} mt={2} mr={4} justify="center">
          <Input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            maxW="200px"
          />

          <Tooltip hasArrow label="Add Product to Warehouse">
            <IconButton
              icon={<AddIcon />}
              aria-label="Add Stock"
              colorScheme="blue"
              onClick={() => handleCreateModal()}
            />
          </Tooltip>
        </HStack>
        <Table variant="striped" colorScheme="twitter">
          <Thead>
            <Tr>
              <Th>Product Name</Th>
              <Th>Product Categories</Th>
              <Th>Total Stock</Th>
              <Th>Warehouse Name</Th>
              <Th isNumeric>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {products.map((stock) => {
              return (
                <Tr key={stock?.id}>
                  <Td>{stock?.product.name}</Td>
                  <Td>{stock?.product.product_category.name}</Td>
                  <Td>{stock?.stock}</Td>
                  <Td>{stock?.warehouse.name}</Td>
                  <Td isNumeric>
                    <Button onClick={() => handleUpdateModal(stock.id)} mr={2}>
                      Edit Stock
                    </Button>
                    <Button onClick={() => handleDeleteModal(stock.id)}>
                      Delete
                    </Button>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>

      <Modal isOpen={isAddStockOpen} onClose={onAddStockClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Stock</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={formikAdd.handleSubmit}>
              <VStack spacing={4} mt={4} mx="auto" maxW="480px">
                <FormControl
                  isInvalid={formikAdd.errors.stock && formikAdd.touched.stock}>
                  <FormLabel htmlFor="address">Product Category</FormLabel>
                  <Select
                    placeholder=" "
                    {...formikAdd.getFieldProps("product_category_id")}
                    onChange={(value) => {
                      fetchProductsModal(value.target.value);
                      formikAdd.handleChange(value);
                    }}>
                    {productsCategoryModal.map((element) => (
                      <option key={element.id} value={element.id}>
                        {element.name}
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>{formikAdd.errors.stock}</FormErrorMessage>
                </FormControl>

                <FormControl
                  isInvalid={
                    formikAdd.errors.products_id &&
                    formikAdd.touched.products_id
                  }>
                  <FormLabel htmlFor="address">Product Name</FormLabel>
                  <Select
                    placeholder=" "
                    {...formikAdd.getFieldProps("products_id")}
                    onChange={(value) => {
                      formikAdd.handleChange(value);
                    }}>
                    {productsModal.map((element) => (
                      <option key={element.id} value={element.id}>
                        {element.name}
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>
                    {formikAdd.errors.products_id}
                  </FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel>Total Stock</FormLabel>
                  <NumberInput
                    min={0}
                    value={formikAdd.values.stock}
                    onChange={(value) => {
                      if (value >= 0) {
                        formikAdd.setFieldValue("stock", value);
                      }
                    }}>
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                <Button
                  type="submit"
                  colorScheme="blue"
                  mr={3}
                  isLoading={formikAdd.isSubmitting}>
                  Add Stock
                </Button>
                <Button onClick={onAddStockClose}>Cancel</Button>
              </VStack>
            </form>
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isEditStockOpen} onClose={onEditStockClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Stock</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                formikUpdate.handleSubmit();
                handleUpdateStock(stockToUpdate, formikUpdate.values);
              }}>
              <VStack spacing={4} mt={4} mx="auto" maxW="480px">
                <FormControl
                  isInvalid={
                    formikUpdate.errors.stock && formikUpdate.touched.stock
                  }>
                  <FormLabel>Quantity Stock to Added</FormLabel>
                  <NumberInput
                    value={formikUpdate.values.stock}
                    onChange={(value) => {
                      // Get the current stock from the server
                      const currentStock =
                        products.find((product) => product.id === stockToUpdate)
                          ?.stock || 0;

                      // Check if the sum is less than zero
                      if (currentStock + parseInt(value) < 0) {
                        toast({
                          title: "Stock cannot go below zero.",
                          status: "error",
                          duration: 3000,
                          isClosable: true,
                        });
                        return;
                      }

                      formikUpdate.setFieldValue("stock", value);
                    }}>
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl
                  isInvalid={
                    formikUpdate.errors.stock && formikUpdate.touched.stock
                  }>
                  <FormLabel htmlFor="address">Description</FormLabel>
                  <Input
                    placeholder=" "
                    {...formikUpdate.getFieldProps("description")}
                    onChange={formikUpdate.handleChange}
                    onBlur={formikUpdate.handleBlur}
                    value={formikUpdate.values.description}></Input>
                  <FormErrorMessage>
                    {formikUpdate.errors.description}
                  </FormErrorMessage>
                </FormControl>
              </VStack>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleConfirmUpdate}>
              Update Stock
            </Button>
            <Button onClick={onEditStockClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isDeleteProductOpen} onClose={onDeleteProductClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Address</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to delete this address? This action cannot be
            undone.
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={handleConfirmDelete}>
              Delete
            </Button>
            <Button variant="ghost" onClick={onDeleteProductClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default WarehouseStock;
