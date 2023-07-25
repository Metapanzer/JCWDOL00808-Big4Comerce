import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Flex,
  Box,
  Input,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
  Text,
  TableCaption,
  useToast,
} from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";
import { FaSort, FaFilter, FaPlus } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import { useState, useEffect } from "react";
import axios from "axios";
import AddProductModal from "../../components/addProductModal";
import PatchProductModal from "../../components/PatchProductModal";
import DeleteConfirmation from "../../components/DeleteConfirmationDialog";

function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("updatedAt");
  const [sortText, setSortText] = useState("Date");
  const [order, setOrder] = useState("DESC");
  const toast = useToast();
  const [isFirstModalOpen, setIsFirstModalOpen] = useState(false);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [productData, setProductData] = useState(null);

  useEffect(() => {
    getProducts();
    fetchData();
  }, [page, keyword, sort, order, selectedCategoryId]);

  const getProducts = async () => {
    const response = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/product/listproduct?search_query=${keyword}&page=${page}&limit=${limit}`,
      {
        params: {
          sort,
          order,
        },
      }
    );
    setProducts(response.data.result);
    setPage(response.data.page);
    setPages(response.data.totalPage);
    setRows(response.data.totalRows);
  };

  const deleteProducts = async (id) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/product/deleteproduct/${id}`
      );
      getProducts();
      toast({
        title: `Product success deleted`,
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: `${error.response.data.message}`,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  };

  const fetchData = async () => {
    // Fetch the product data here, and update the productData state.
    const response = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/product/productId/${selectedCategoryId}`
    );
    setProductData(response.data);
  };

  const handleFirstModalOpen = () => {
    setIsFirstModalOpen(true);
  };

  const handleSecondModalOpen = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setIsSecondModalOpen(true);
  };

  const handleModalClose = () => {
    setSelectedCategoryId(null);
    setIsFirstModalOpen(false);
    setIsSecondModalOpen(false);
  };

  const handleProductUpdate = () => {
    getProducts();
  };

  const changePage = ({ selected }) => {
    setPage(selected);
  };

  const searchData = (e) => {
    e.preventDefault();
    setPage(0);
    setKeyword(query);
  };

  const handleSort = (value) => {
    setSort(value);
    setPage(0);
    // add switch case to convert value to readable text
    switch (value) {
      case "name":
        setSortText("Name");
        break;
      case "price":
        setSortText("Price");
        break;
      case "updatedAt":
        setSortText("Date");
        break;
      default:
        setSortText(value);
    }
  };

  const handleOrder = (value) => {
    setOrder(value);
    setPage(0);
  };

  function formatRupiah(number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  }

  function formatWeight(weightInGrams) {
    const weightInKilograms = weightInGrams / 1000;
    return `${weightInKilograms} kg`;
  }

  //function untuk memoting deskripsi yang terlalu panjang
  function truncateDescription(description, maxLength) {
    const truncatedDescription = description.slice(0, maxLength);
    const shouldTruncate = description.length > maxLength;

    return shouldTruncate ? truncatedDescription + "..." : description;
  }

  // membuat role admin warehouse hanya bisa read data saja
  const role = localStorage.getItem("role");
  const isButtonDisabled = role === "2";
  const buttonColorScheme = isButtonDisabled ? "gray" : "green";

  return (
    // <div style={{ margin: "auto", width: "70%" }}>
    <div className="container mx-auto px-4 mb-3">
      {/* fitur search */}

      <form onSubmit={searchData}>
        <Flex mt="2" size="sm">
          <Input
            type="text"
            placeholder="Search"
            mr={2}
            width="30%"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button colorScheme="blue" type="submit">
            Search
          </Button>
        </Flex>
      </form>

      {/* fitur untuk filter, sort dan add product */}
      <Flex alignItems="center" mt="2">
        <Box mr={2}>
          <Icon as={FaSort} />
        </Box>
        <Text fontWeight="bold">Sort by:</Text>
        <Menu>
          <MenuButton ml={2} variant="ghost">
            {sortText}
          </MenuButton>
          <MenuList>
            <MenuItem value={sort} onClick={() => handleSort("name")}>
              Name
            </MenuItem>
            <MenuItem value={sort} onClick={() => handleSort("price")}>
              Price
            </MenuItem>
            <MenuItem value={sort} onClick={() => handleSort("updatedAt")}>
              Date
            </MenuItem>
          </MenuList>
        </Menu>
        <Box mr={2} ml="4">
          <Icon as={FaFilter} />
        </Box>
        <Text fontWeight="bold">Order:</Text>
        <Menu>
          <MenuButton ml={2} variant="ghost">
            {order}
          </MenuButton>
          <MenuList>
            <MenuItem value={order} onClick={() => handleOrder("ASC")}>
              Ascending
            </MenuItem>
            <MenuItem value={order} onClick={() => handleOrder("DESC")}>
              Descending
            </MenuItem>
          </MenuList>
        </Menu>
        <Button
          colorScheme="teal"
          size="sm"
          ml="auto"
          leftIcon={<Icon as={FaPlus} />}
          isDisabled={isButtonDisabled}
          onClick={handleFirstModalOpen}
        >
          Add Product
        </Button>
        <AddProductModal
          isOpen={isFirstModalOpen}
          onClose={handleModalClose}
          onProductUpdate={handleProductUpdate}
        />
      </Flex>

      {/* fitur table */}
      <Table
        variant="striped"
        size="sm"
        mt="2"
        textAlign="center"
        border="1px solid gray"
      >
        <TableCaption mb="2">
          Total Rows: {rows} Page: {rows ? page + 1 : 0} of {pages}
        </TableCaption>
        <Thead>
          <Tr>
            <Th>No</Th>
            <Th>Name</Th>
            <Th>Description</Th>
            <Th>Price</Th>
            <Th>Weight</Th>
            <Th>Image</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {products.map((product, index) => (
            <Tr key={product.id} align="center">
              <Td fontSize="sm" fontWeight="medium">
                {index + 1 + page * limit}
              </Td>
              <Td fontSize="sm" fontWeight="medium">
                {product.name}
              </Td>
              <Td fontSize="sm">
                {truncateDescription(product.description, 35)}
              </Td>
              <Td fontSize="sm">{formatRupiah(product.price)}</Td>
              <Td fontSize="sm">{formatWeight(product.weight)}</Td>
              <Td fontSize="sm">
                <img
                  src={`${process.env.REACT_APP_API_BASE_URL}/${product.imageUrl}`}
                  alt="product"
                  width="50"
                />
              </Td>
              <Td>
                <Box display="flex">
                  <IconButton
                    size="sm"
                    bgColor="green.500"
                    aria-label="Edit"
                    icon={<EditIcon />}
                    mr={2}
                    borderRadius="full"
                    _hover={{ bg: "green.700" }}
                    isDisabled={isButtonDisabled}
                    onClick={() => {
                      handleSecondModalOpen(product.id);
                      // setSelectedCategoryId(product.id);
                    }}
                  />

                  <DeleteConfirmation
                    onDelete={() => deleteProducts(product.id)}
                    isButtonDisabled={isButtonDisabled}
                  />
                </Box>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <PatchProductModal
        categoryId={selectedCategoryId}
        isOpen={isSecondModalOpen}
        onClose={handleModalClose}
        onProductUpdate={handleProductUpdate}
        productData={productData}
      />
      {/* fitur paginate */}
      <Flex alignItems="center" justifyContent="center">
        <ReactPaginate
          previousLabel={"< Prev"}
          nextLabel={"Next >"}
          pageCount={Math.min(10, pages)}
          onPageChange={changePage}
          containerClassName={"flex"}
          pageLinkClassName={
            "mx-2 bg-gray-200 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
          }
          previousLinkClassName={
            "mx-2 bg-gray-200 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
          }
          nextLinkClassName={
            "mx-2 bg-gray-200 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
          }
          activeLinkClassName={
            "mx-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          }
          disabledLinkClassName={
            "mx-2 bg-gray-300 text-gray-500 font-bold py-2 px-4 rounded"
          }
        />
      </Flex>
    </div>
  );
}

export default ManageProducts;
