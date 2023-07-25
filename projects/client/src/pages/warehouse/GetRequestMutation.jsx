import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
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
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
} from "@chakra-ui/react";
import { FaSort, FaFilter, FaCheck, FaTimes } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import { useState, useEffect } from "react";
import axios from "axios";

const StockRequestList = () => {
  const [stockRequests, setStockRequests] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState({});
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState("");
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [sortText, setSortText] = useState("Date");
  const [order, setOrder] = useState("DESC");
  const toast = useToast();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchStockRequests();
  }, [page, keyword, sort, order]);

  const fetchStockRequests = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/mutations/getrequest-stock?search_query=${keyword}&page=${page}&limit=${limit}`,
        {
          headers: { Authorization: token },
          params: {
            sort,
            order,
          },
        }
      );
      if (response.data.result.length === 0) {
        setStockRequests([]);
        setPages(0);
        setRows(0);
      } else {
        setStockRequests(response.data.result);
        setPage(response.data.page);
        setPages(response.data.totalPage);
        setRows(response.data.totalRows);
      }
    } catch (error) {
      toast({
        title: `${error.response.data.message}`,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_BASE_URL}/mutations/confirm-mutation/${id}`,
        { status },
        {
          headers: { Authorization: token },
        }
      );
      toast({
        title: `Confirm Stock Mutation Success`,
        status: "success",
        duration: 9000,
        isClosable: true,
      });
      fetchStockRequests();
    } catch (error) {
      toast({
        title: `${error.response.data.message}`,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  };

  function handleIconClick(id, status, rowIndex) {
    setDialogAction(id);
    setSelectedStatus(status);
    setIsPopoverOpen((prevState) => ({ ...prevState, [rowIndex]: true }));
  }

  function handlePopoverClose() {
    setIsPopoverOpen(false);
    setDialogAction("");
  }

  function handleDialogConfirm() {
    handleStatusUpdate(dialogAction, selectedStatus);
    handlePopoverClose();
  }

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
      case "products_id":
        setSortText("Product");
        break;
      case "quantity":
        setSortText("Quantity");
        break;
      case "from_warehouse_id":
        setSortText("From Warehouse");
        break;
      case "to_warehouse_id":
        setSortText("To Warehouse");
        break;
      case "createdAt":
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

  const formatDate = (date) => {
    if (date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = ("0" + (d.getMonth() + 1)).slice(-2);
      const day = ("0" + d.getDate()).slice(-2);
      return `${day}/${month}/${year}`;
    }

    return "";
  };

  return (
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
            <MenuItem value={sort} onClick={() => handleSort("products_id")}>
              Product
            </MenuItem>
            <MenuItem value={sort} onClick={() => handleSort("quantity")}>
              Quantity
            </MenuItem>
            <MenuItem
              value={sort}
              onClick={() => handleSort("from_warehouse_id")}
            >
              From Warehouse
            </MenuItem>
            <MenuItem
              value={sort}
              onClick={() => handleSort("to_warehouse_id")}
            >
              To Warehouse
            </MenuItem>
            <MenuItem value={sort} onClick={() => handleSort("createdAt")}>
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
      </Flex>

      {/* fitur table */}
      <Table variant="striped" size="sm" mt="2" textAlign="center">
        <TableCaption mb="2">
          Total Rows: {rows} Page: {rows ? page + 1 : 0} of {pages}
        </TableCaption>
        <Thead>
          <Tr>
            <Th>No</Th>
            <Th>Product</Th>
            <Th>Quantity</Th>
            <Th>From</Th>
            <Th>To</Th>
            <Th>Status</Th>
            <Th>Date</Th>
            <Th>Approved Date</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {stockRequests.length === 0 ? (
            <Text>No Data Available</Text>
          ) : (
            stockRequests.map((mutation, index) => (
              <Tr key={mutation.id} align="center">
                <Td fontSize="sm" fontWeight="medium">
                  {index + 1 + page * limit}
                </Td>
                <Td fontSize="sm">{mutation.product.name}</Td>
                <Td fontSize="sm">{mutation.quantity}</Td>
                <Td fontSize="sm">{mutation.from_warehouse.name}</Td>
                <Td fontSize="sm">{mutation.to_warehouse.name}</Td>
                <Td fontSize="sm">{mutation.mutation_type}</Td>
                <Td fontSize="sm">{formatDate(mutation.createdAt)}</Td>
                <Td fontSize="sm">{formatDate(mutation.approvedAt)}</Td>
                <Td>
                  <Box display="flex">
                    {mutation.mutation_type === "Pending" && (
                      <div key={mutation.id}>
                        <Box position="relative">
                          <IconButton
                            icon={<FaCheck />}
                            name="check"
                            size="sm"
                            color="green.500"
                            _hover={{ color: "green.600" }}
                            onClick={() =>
                              handleIconClick(mutation.id, "ACCEPT", index)
                            }
                          />
                          <IconButton
                            icon={<FaTimes />}
                            name="close"
                            size="sm"
                            color="red.500"
                            _hover={{ color: "red.600" }}
                            onClick={() =>
                              handleIconClick(mutation.id, "REJECT", index)
                            }
                          />
                        </Box>
                        <Box position="relative">
                          <Popover
                            isOpen={isPopoverOpen[index]}
                            onClose={() =>
                              setIsPopoverOpen((prevState) => ({
                                ...prevState,
                                [index]: false,
                              }))
                            }
                            placement="bottom-start"
                            closeOnBlur={false}
                          >
                            <PopoverContent>
                              <PopoverHeader fontWeight="bold">
                                {selectedStatus === "ACCEPT"
                                  ? "Confirm Accept"
                                  : "Confirm Reject"}
                              </PopoverHeader>
                              <PopoverBody>
                                Are you sure you want to{" "}
                                {selectedStatus === "ACCEPT"
                                  ? "accept"
                                  : "reject"}
                                ?
                              </PopoverBody>
                              <Flex justify="flex-end" mt={2}>
                                <Button
                                  variant="ghost"
                                  onClick={handlePopoverClose}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  colorScheme="teal"
                                  ml={3}
                                  onClick={handleDialogConfirm}
                                >
                                  Confirm
                                </Button>
                              </Flex>
                            </PopoverContent>
                            <PopoverTrigger>
                              <Box
                                position="absolute"
                                top="-10px"
                                right="-10px"
                                width="40px"
                                height="40px"
                                borderRadius="full"
                                bg="transparent"
                              />
                            </PopoverTrigger>
                          </Popover>
                        </Box>
                      </div>
                    )}
                  </Box>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>

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
};

export default StockRequestList;
