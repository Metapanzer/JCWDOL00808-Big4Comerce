import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@chakra-ui/react";
import { FaSort, FaFilter } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import SendOrderModal from "../../components/SendOrderModal";

function ListOrders() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("id");
  const [order, setOrder] = useState("DESC");
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState([]);
  const [allData, getAllData] = useState([]);
  const [isConfirmRejectModalOpen, setIsConfirmRejectModalOpen] =
    useState(false);
  const [isConfirmAcceptModalOpen, setIsConfirmAcceptModalOpen] =
    useState(false);

  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  const showWarningToast = useCallback(
    (message) => {
      toast({
        title: message,
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    },
    [toast]
  );

  const showErrorToast = useCallback(
    (message) => {
      toast({
        title: message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
    [toast]
  );

  useEffect(() => {
    getOrders(userRole);
  }, [page, keyword, sort, order]);

  const getOrders = async (userRole) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/orders/get-order?search=${keyword}&page=${page}&limit=${limit}&role=${userRole}`,
        {
          params: {
            sort,
            order,
          },
          headers: { Authorization: token },
        }
      );

      setOrders(response.data.result);
      setPage(response.data.page);
      setPages(response.data.totalPage);
      setRows(response.data.totalRows);
    } catch (error) {
      console.error(error);
      if (
        error.response &&
        error.response.status === 404 &&
        error.response.data.message
      ) {
        showWarningToast(error.response.data.message); // Update this line
      } else {
        showErrorToast("Error fetching orders"); // Update this line
      }
    }
  };

  const fetchOrderDetailsAndOpenModal = async (orderId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/orders/get-order-details/${orderId}`,
        {
          headers: { Authorization: token },
        }
      );
      setOrderDetails(response.data);
      const responses = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/orders/allorders-data/${orderId}`,
        {
          headers: { Authorization: token },
        }
      );
      getAllData(responses.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error fetching order details",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
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
    if (value === "warehouseName") {
      setSort(["warehouse", "name"]);
    } else {
      setSort(value);
    }
    setPage(0);
  };

  const handleOrder = (value) => {
    setOrder(value);
    setPage(0);
  };

  const openConfirmAcceptModal = () => {
    setIsConfirmAcceptModalOpen(true);
  };

  const closeConfirmAcceptModal = () => {
    setIsConfirmAcceptModalOpen(false);
  };

  const openConfirmRejectModal = () => {
    setIsConfirmRejectModalOpen(true);
  };

  const closeConfirmRejectModal = () => {
    setIsConfirmRejectModalOpen(false);
  };

  const handleAcceptPayment = async (id) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/admin/acceptPayment/${id}`,
        {
          headers: { Authorization: token },
        }
      );
      closeConfirmAcceptModal();
      setIsModalOpen(false);
      toast({
        title: "Success Accept payment",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
      getOrders();
    } catch (error) {
      console.error(error);
      closeConfirmAcceptModal();
      toast({
        title: `${error.response.data.message}`,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  };

  const handleRejectPayment = async (id) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/admin/rejectPayment/${id}`,
        {
          headers: { Authorization: token },
        }
      );
      closeConfirmRejectModal();
      setIsModalOpen(false);
      toast({
        title: "Success rejecting payment",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
      getOrders();
    } catch (error) {
      console.error(error);
      toast({
        title: `${error.message}`,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  };

  const getSortLabel = (sortValue) => {
    if (sortValue === "status") {
      return "Status";
    } else if (
      Array.isArray(sortValue) &&
      sortValue[0] === "warehouse" &&
      sortValue[1] === "name"
    ) {
      return "Warehouse1";
    } else if (sortValue === "total_price") {
      return "Total Price";
    } else {
      return "ID";
    }
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

  // membuat role admin warehouse hanya bisa read data saja
  // const role = localStorage.getItem("role");

  const {
    isOpen: isAlertOpen,
    onOpen: onAlertOpen,
    onClose: onAlertClose,
  } = useDisclosure();
  const cancelRef = useRef();

  const handleCancelOrder = (value) => {
    axios
      .post(
        // `${process.env.REACT_APP_API_BASE_URL}/orders/cancel-and-refund`,
        `${process.env.REACT_APP_API_BASE_URL}/orders/cancel-order`,
        {
          id: value,
        },
        {
          headers: { Authorization: token },
        }
      )
      .then((response) => {
        toast({
          title: `${response.data.message}`,
          duration: 9000,
          isClosable: true,
          onCloseComplete: () => window.location.reload(false),
        });
      })
      .catch((error) => {
        console.log(error);
        toast({
          title: `${error.message}`,
          duration: 9000,
          isClosable: true,
        });
      });
  };

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
          <Button colorScheme="blue" type="button" onClick={searchData}>
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
            {getSortLabel(sort)}
          </MenuButton>
          <MenuList>
            <MenuItem value={sort} onClick={() => handleSort("status")}>
              Status
            </MenuItem>
            <MenuItem value={sort} onClick={() => handleSort("warehouseName")}>
              Warehouse
            </MenuItem>
            <MenuItem value={sort} onClick={() => handleSort("total_price")}>
              Total Price
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
            <Th>Warehouse Name</Th>
            <Th>Recipient</Th>
            <Th>Grand Total</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {orders.map((orderData) => (
            <Tr key={orderData.id} align="center">
              <Td fontSize="sm" fontWeight="medium">
                {orderData.warehouse.name}
              </Td>
              <Td fontSize="sm">{orderData.user_address.recipient}</Td>
              <Td fontSize="sm">
                {formatRupiah(orderData.total_price + orderData.shipping_cost)}
              </Td>
              <Td fontSize="sm">{orderData.status}</Td>
              {/* <Td fontSize="sm">
                
                {orderData.payment_proof ? (
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={() => {
                      // Your click event handler here
                    }}
                    disabled={!orderData.payment_proof}
                    mr={2}>
                    Show Payment Proof
                  </Button>
                ) : (
                  "Data Not Found"
                )}
              </Td> */}
              <Td>
                <Box display="flex">
                  <Button
                    size="sm"
                    mr={2}
                    _hover={{ bg: "yellow.500" }}
                    colorScheme="yellow"
                    onClick={() => fetchOrderDetailsAndOpenModal(orderData.id)}>
                    Order Details
                  </Button>
                </Box>
              </Td>
            </Tr>
          ))}
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

      {/* modal untuk order details */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Payment Information</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box
              maxWidth="auto"
              mx="auto"
              mt="8"
              maxHeight="70vh"
              overflowY="auto"
              width="100%">
              <Text fontSize="2xl" fontWeight="bold" mb="4">
                Order Confirmation Payment
              </Text>

              <Text mb="2">Order ID: {allData.id}</Text>
              <Text mb="4">User ID: {allData.users_id}</Text>

              <Text fontSize="lg" fontWeight="bold" mb="2">
                Order Details:
              </Text>
              <Table variant="simple" size="sm" mb="4">
                <Thead>
                  <Tr>
                    <Th>Product Name</Th>
                    <Th>Quantity</Th>
                    <Th>Unit Price</Th>
                    <Th>Total Price</Th>
                    <Th>Product Weight</Th>
                    <Th>Image URL</Th>
                    <Th>Product ID</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {orderDetails.map((item) => (
                    <Tr key={item.id}>
                      <Td>{item.product_name}</Td>
                      <Td>{item.quantity}</Td>
                      <Td>{formatRupiah(item.product_price)}</Td>
                      <Td>
                        {formatRupiah(item.quantity * item.product_price)}
                      </Td>
                      <Td>{formatWeight(item.product_weight)}</Td>
                      <Td>
                        <img
                          src={`${process.env.REACT_APP_API_BASE_URL}/${item.imageUrl}`}
                          alt="Product"
                          width="50"
                        />
                      </Td>
                      <Td>{item.products_id}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>

              <Text fontSize="lg" fontWeight="bold" mb="2">
                Order Summary:
              </Text>
              <Text mb="2">Shipping Method: {allData.shipping_method}</Text>
              <Text mb="2">
                Shipping Cost: {formatRupiah(allData.shipping_cost)}
              </Text>
              <Text mb="4">
                Total Price: {formatRupiah(allData.total_price)}
              </Text>

              <Text fontSize="lg" fontWeight="bold" mb="2">
                Shipping Information:
              </Text>
              <Text mb="2">
                Shipping Address ID: {allData.user_addresses_id}
              </Text>
              <Text mb="4">
                {allData.user_address?.address} {allData.user_address?.city},{" "}
                {allData.user_address?.province}{" "}
              </Text>

              <Text fontSize="lg" fontWeight="bold" mb="2">
                Warehouse Information:
              </Text>
              <Text mb="2">Warehouse ID: {allData.warehouses_id}</Text>
              <Text mb="4">{allData.warehouse?.name}</Text>

              <Text fontSize="lg" fontWeight="bold" mb="2">
                Payment Information:
              </Text>
              <Text mb="2">Payment Status: {allData.status}</Text>
              <Box>
                <Text mb="4">Payment Proof:</Text>
                {allData.payment_proof === null ||
                allData.status === "Previous payment proof rejected" ? (
                  <>
                    <Text mb="4">No Payment Proof</Text>
                  </>
                ) : (
                  <img
                    src={`${process.env.REACT_APP_API_BASE_URL}/${allData.payment_proof}`}
                    alt="Payment Proof"
                    width="200"
                  />
                )}
              </Box>
            </Box>
          </ModalBody>

          <ModalFooter>
            {allData.status === "Canceled" ||
            allData.status === "Waiting for confirmation" ||
            allData.status === "Shipped" ||
            allData.status === "Order confirmed" ||
            allData.status === "Previous payment proof rejected" ? null : (
              <>
                <Flex mt={3}>
                  <SendOrderModal
                    orders_id={allData.id}
                    orders_status={allData.status}
                    func={getOrders}
                    onClose={() => setIsModalOpen(false)}
                  />
                  <Button
                    mr={2}
                    _hover={{ bg: "red.600" }}
                    colorScheme="red"
                    onClick={() => {
                      onAlertOpen();
                    }}>
                    Cancel Order
                  </Button>
                </Flex>
                <AlertDialog
                  isOpen={isAlertOpen}
                  leastDestructiveRef={cancelRef}
                  onClose={onAlertClose}>
                  <AlertDialogOverlay>
                    <AlertDialogContent>
                      <AlertDialogHeader fontSize="lg" fontWeight="bold">
                        Cancel order
                      </AlertDialogHeader>

                      <AlertDialogBody>
                        Are you sure cancelling this order? This action can't be
                        undone.
                      </AlertDialogBody>

                      <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onAlertClose}>
                          Cancel
                        </Button>
                        <Button
                          colorScheme="red"
                          onClick={() => {
                            handleCancelOrder(allData.id);
                            onAlertClose();
                            setIsModalOpen(false);
                          }}
                          ml={3}>
                          Yes, cancel this order
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialogOverlay>
                </AlertDialog>
              </>
            )}
            {allData.status === "Waiting for confirmation" ? (
              <>
                <Button
                  colorScheme="green"
                  mr={3}
                  onClick={openConfirmAcceptModal}>
                  Accept
                </Button>
                <Button colorScheme="red" onClick={openConfirmRejectModal}>
                  Reject
                </Button>
              </>
            ) : null}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal for reject Payment */}
      <Modal
        isOpen={isConfirmRejectModalOpen}
        onClose={closeConfirmRejectModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reject Payment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to reject this payment?</Text>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="red"
              mr={3}
              onClick={() => handleRejectPayment(allData.id)}>
              Reject
            </Button>
            <Button onClick={closeConfirmRejectModal}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal for Accepted Payment */}
      <Modal
        isOpen={isConfirmAcceptModalOpen}
        onClose={closeConfirmAcceptModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Accept Payment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to Accept this payment?</Text>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="teal"
              mr={3}
              onClick={() => handleAcceptPayment(allData.id)}>
              Accept
            </Button>
            <Button onClick={closeConfirmAcceptModal}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default ListOrders;
