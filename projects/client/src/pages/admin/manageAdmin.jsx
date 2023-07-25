import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";
import { useNavigate } from "react-router-dom";
import {
  Flex,
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
  Text,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  useToast,
  Input,
  Table,
  Tr,
  Td,
  Th,
  Tbody,
  TableCaption,
  Thead,
} from "@chakra-ui/react";
import { FaSort, FaFilter, FaPlus } from "react-icons/fa";
import RegisterAdminModal from "../../components/addAdminModal";
import PatchAdminModal from "../../components/patchAdminModal";

const ManageAdmin = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("updatedAt");
  const [sortText, setSortText] = useState("Date");
  const [order, setOrder] = useState("DESC");
  const [roleAdmin, setRoleAdmin] = useState("");
  const [isFirstModalOpen, setIsFirstModalOpen] = useState(false);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const cancelRef = useRef();
  const toast = useToast();

  useEffect(() => {
    getUsers();
  }, [page, keyword, sort, order, roleAdmin, selectedAdminId]);

  const getUsers = async () => {
    const response = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/admin/getAdmin?search_query=${keyword}&page=${page}&limit=${limit}&role_admin=${roleAdmin}`,
      {
        params: {
          sort,
          order,
        },
      }
    );
    setUsers(response.data.result);
    setPage(response.data.page);
    setPages(response.data.totalPage);
    setRows(response.data.totalRows);
  };

  const changePage = ({ selected }) => {
    setPage(selected);
  };

  const deleteAdmin = async (id) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/admin/deleteAdmin/${id}`
      );
      getUsers();
      toast({
        title: `Admin is deleted`,
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    } catch (error) {
      console.log(error);
      toast({
        title: `${error.response.data.message}`,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
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
      case "full_name":
        setSortText("Name");
        break;
      case "email":
        setSortText("Email");
        break;
      default:
        setSortText(value);
    }
  };

  const handleAdminUpdate = () => {
    getUsers();
  };

  const handleFirstModalOpen = () => {
    setIsFirstModalOpen(true);
  };

  const handleSecondModalOpen = (isOpen) => {
    setIsSecondModalOpen(isOpen);
  };

  const openPatchAdminModal = (adminId) => {
    setSelectedAdminId(adminId);
    handleSecondModalOpen(true);
  };

  const handleModalClose = () => {
    setSelectedAdminId(null);
    setIsFirstModalOpen(false);
    setIsSecondModalOpen(false);
  };

  const handleOrder = (e) => {
    setOrder(e.currentTarget.value);
    setPage(0);
  };

  const handleRoleAdmin = (value) => {
    setRoleAdmin(value);
    setPage(0);
  };

  const openDeleteDialog = (adminId) => {
    setAdminToDelete(adminId);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setAdminToDelete(null);
  };

  const navigate = useNavigate();

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

      {/* fitur untuk filter, sort dan add Admin */}
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
            <MenuItem value={sort} onClick={() => handleSort("full_name")}>
              Name
            </MenuItem>
            <MenuItem value={sort} onClick={() => handleSort("email")}>
              Email
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
            <MenuItem value="ASC" onClick={(e) => handleOrder(e)}>
              Ascending
            </MenuItem>
            <MenuItem value="DESC" onClick={(e) => handleOrder(e)}>
              Descending
            </MenuItem>
          </MenuList>
        </Menu>
        <Box mr={2} ml="4">
          <Icon as={FaFilter} />
        </Box>
        <Text fontWeight="bold">Role Admin :</Text>
        <Menu>
          <MenuButton ml={2} variant="ghost">
            {roleAdmin === 1
              ? "Admin"
              : roleAdmin === 2
              ? "Admin Warehouse"
              : "All"}
          </MenuButton>

          <MenuList>
            <MenuItem onClick={() => handleRoleAdmin("")}>All</MenuItem>
            <MenuItem onClick={() => handleRoleAdmin(1)}>Admin</MenuItem>
            <MenuItem onClick={() => handleRoleAdmin(2)}>
              Admin Warehouse
            </MenuItem>
          </MenuList>
        </Menu>

        <Button
          colorScheme="teal"
          size="sm"
          ml="auto"
          leftIcon={<Icon as={FaPlus} />}
          onClick={handleFirstModalOpen}
        >
          Add Admin
        </Button>
        <RegisterAdminModal
          isOpen={isFirstModalOpen}
          onClose={handleModalClose}
          onAdminPatch={handleAdminUpdate}
        />
      </Flex>

      {/* tabel list Admin */}
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
            <Th>Email</Th>
            <Th>Phone Number</Th>
            <Th>Profile Picture</Th>
            <Th>Role Admin</Th>
            <Th style={{ textAlign: "center" }}>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {users.map((user, index) => (
            <Tr key={user.id} align="center">
              <Td fontSize="sm" fontWeight="medium">
                {index + 1 + page * limit}
              </Td>
              <Td fontSize="sm" fontWeight="medium">
                {user.full_name}
              </Td>
              <Td fontSize="sm">{user.email}</Td>
              <Td fontSize="sm">{user.phone_number}</Td>
              <Td fontSize="sm">
                <img
                  src={`${process.env.REACT_APP_API_BASE_URL}/${user.profile_picture}`}
                  alt="Admin"
                  width="50"
                />
              </Td>
              <Td fontSize="sm">
                {user.role == 1 ? "Admin" : "Admin Warehouse"}
              </Td>
              <Td>
                <Flex justifyContent="space-between">
                  {/* button patch admin */}
                  <button
                    class="bg-teal-600 hover:bg-teal-800 text-white font-bold py-2 px-4 rounded"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      openPatchAdminModal(user.id);
                    }}
                  >
                    Edit
                  </button>
                  {/* button assign admin */}
                  {user.role == 2 ? (
                    <button class="bg-gray-400 text-white font-bold py-2 px-4 rounded" disabled>
                      Assign
                    </button>
                  ) : (
                    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => navigate(`/admin/assign/${user.id}`)}>
                      Assign
                    </button>
                  )}
                  {/* button delete admin */}
                  <button
                    class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    onMouseDown={() => openDeleteDialog(user.id)}
                  >
                    Delete
                  </button>
                </Flex>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Modal Patch Admin */}
      <PatchAdminModal
        adminId={selectedAdminId}
        isOpen={isSecondModalOpen}
        onClose={handleModalClose}
        onAdminPatch={handleAdminUpdate}
      />
      {/* Batas Modal Patch Admin */}

      <nav
        class="flex items-center justify-center mt-4 mb-10"
        key={rows}
        role="navigation"
        aria-label="pagination"
      >
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
      </nav>

      {/* Modal to dialog alert delete Admin */}
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        leastDestructiveRef={cancelRef}
        motionPreset="slideInBottom"
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete Admin
          </AlertDialogHeader>
          <AlertDialogBody>
            Are you sure you want to delete this admin? This action cannot be
            undone.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={closeDeleteDialog}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={() => {
                deleteAdmin(adminToDelete);
                closeDeleteDialog();
              }}
              ml={3}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageAdmin;
