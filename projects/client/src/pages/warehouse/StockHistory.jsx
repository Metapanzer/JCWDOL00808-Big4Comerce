import {
  Flex,
  Box,
  Card,
  CardBody,
  Text,
  Select,
  FormControl,
  FormLabel,
  VStack,
  Button,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Axios from "axios";
import { AiOutlineArrowUp, AiOutlineArrowDown } from "react-icons/ai";
import ReactPaginate from "react-paginate";
import { useNavigate } from "react-router-dom";

const History = () => {
  let role = localStorage.getItem("role");
  let token = localStorage.getItem("token");

  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [stockHistories, setStockHistories] = useState([]);
  const [warehouseData, setWarehouseData] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [loading, setLoading] = useState(true);
  const [warehouseId, setWarehouseId] = useState(0);
  const [warehouseName, setWarehouseName] = useState("");

  const [page, setPage] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const navigate = useNavigate();

  const getHistoryData = () => {
    let warehouse = "";
    if (role == 1 && role) {
      warehouse = selectedWarehouse;
    } else if (role == 2 && role) {
      warehouse = warehouseId;
    }
    Axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/histories/getAllHistories?page=${page}`,
      {
        warehouse,
        month: month,
        year: year,
      },
      {
        headers: { Authorization: token },
      }
    )
      .then((response) => {
        setStockHistories(response.data.data);
        setWarehouseData(response.data.warehouse);
        setTotalPage(response.data.totalPage);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.log(error);
      });
  };

  const getWarehouseId = () => {
    Axios.get(`${process.env.REACT_APP_API_BASE_URL}/histories/getWarehouseId`, {
      headers: { Authorization: token },
    })
      .then((response) => {
        setWarehouseId(response.data.id);
        setWarehouseName(response.data.name);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    getHistoryData();
  }, [warehouseId, role, selectedWarehouse, page, month, year]);

  useEffect(() => {
    getWarehouseId();
  }, [role]);

  const showStockHistories = () => {
    return stockHistories.map((value) => {
      return (
        <Tr key={value.id}>
          <Td>{value.name}</Td>
          <Td>
            <Flex>
              <AiOutlineArrowDown style={{ marginTop: 1, marginRight: 10 }} />
              {value.stockIn}
            </Flex>
          </Td>
          <Td>
            <Flex>
              <AiOutlineArrowUp style={{ marginTop: 1, marginRight: 10 }} />
              {value.stockOut}
            </Flex>
          </Td>
          <Td>{value.latestStock}</Td>
          <Td>
            <Button colorScheme="blue" onClick={() => navigate(`/warehouse/history-details?id=${value.products_id}`)}>
              View details
            </Button>
          </Td>
        </Tr>
      );
    });
  };

  const handlePageClick = (data) => {
    setPage(data.selected);
  };

  return (
    <>
      <Flex flexDirection="column">
        <Box mt="10">
          <Text fontSize="3xl" as="b">
            Stock History
          </Text>
          <Text>Monitor and manage product availability to track your warehouses' performance. View history of all products.</Text>
        </Box>
        <Flex>
          {loading ? (
            <Spinner color="red.500" />
          ) : stockHistories.length !== 0 && !loading ? (
            <Box id="tabel stock histories" mt="10" mb="14">
              <TableContainer bg="white" border="1px" borderColor="gray.200">
                <Table variant="striped" size="md">
                  <Thead>
                    <Tr>
                      <Th>Product Name</Th>
                      <Th>Stock In</Th>
                      <Th>Stock Out</Th>
                      <Th>Latest Stock</Th>
                      <Th isNumeric>Action</Th>
                    </Tr>
                  </Thead>
                  <Tbody>{showStockHistories()}</Tbody>
                </Table>
              </TableContainer>
            </Box>
          ) : (
            <Text as="b" fontSize="xl" mt="40">
              There was no stock changes, or<br></br>you may check the filter that you are using.
            </Text>
          )}
          <Box id="sort filter and search" mx="50" mt="100">
            <Card maxW="xs" border="1px" borderColor="gray.200">
              <CardBody>
                <VStack>
                  <FormControl>
                    <FormLabel>Warehouse:</FormLabel>
                    {role == 2 ? (
                      <>
                        <Select onChange={(element) => setSelectedWarehouse(element.target.value)}>
                          <option value="">{warehouseName}</option>
                        </Select>
                      </>
                    ) : (
                      <>
                        <Select onChange={(element) => setSelectedWarehouse(element.target.value)}>
                          <option value="">All Warehouse</option>
                          {warehouseData?.map((value) => {
                            return <option value={value.id}>{value.name}</option>;
                          })}
                        </Select>
                      </>
                    )}
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>
            <Card maxW="xs" border="1px" borderColor="gray.200" mt="30">
              <CardBody>
                <FormControl>
                  <FormLabel>Month:</FormLabel>
                  <Select placeholder="Select month" onChange={(element) => setMonth(element.target.value)}>
                    <option value={1}>January</option>
                    <option value={2}>February</option>
                    <option value={3}>March</option>
                    <option value={4}>April</option>
                    <option value={5}>Mei</option>
                    <option value={6}>June</option>
                    <option value={7}>July</option>
                    <option value={8}>August</option>
                    <option value={9}>September</option>
                    <option value={10}>October</option>
                    <option value={11}>November</option>
                    <option value={12}>December</option>
                  </Select>
                </FormControl>
              </CardBody>
            </Card>
            <Card maxW="xs" border="1px" borderColor="gray.200" mt="30">
              <CardBody>
                <VStack>
                  <FormControl>
                    <FormLabel>Year:</FormLabel>
                    <Select placeholder="Select year" onChange={(element) => setYear(element.target.value)}>
                      <option value={2022}>2022</option>
                      <option value={2023}>2023</option>
                      <option value={2024}>2024</option>
                    </Select>
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>
          </Box>
        </Flex>
        <Box id="pagination" className="flex items-center justify-center">
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
            pageLinkClassName={"mx-2 bg-gray-200 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"}
            previousLinkClassName={"mx-2 bg-gray-200 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"}
            nextLinkClassName={"mx-2 bg-gray-200 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"}
          />
        </Box>
      </Flex>
    </>
  );
};

export default History;
