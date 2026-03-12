import artPieceService from "./artPiece.service";

import * as dotenv from "dotenv";
dotenv.config();

const login = async (username: string, password: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_USER_AUTHENTICATE_URL}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to login");
  }

  const {
    token,
    username: actualUsername,
    role,
    userId,
  } = await response.json();

  return {
    token,
    username: actualUsername,
    role,
    userId,
  };
};

const register = async (
  username: string,
  password: string,
  email: string,
  firstName: string,
  lastName: string
) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_ADD_USER_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, email, firstName, lastName }),
    });

    if (!response.ok) {
      throw new Error("Failed to register");
    }

    const { token, username: actualUsername, role, id } = await response.json();

    return {
      token,
      username: actualUsername,
      role,
      id,
    };
  } catch (error) {
    console.error("Registration error:", error);
    throw new Error("Registration failed");
  }
};

const getUsersLikedItems = async (token: string) => {
  const url = `${process.env.NEXT_PUBLIC_GET_USERS_LIKED_ITEMS_URL}`;

  const decodedToken = decodeJWT(token);
  if (!decodedToken) {
    throw new Error("Invalid token");
  }

  const userId = decodedToken.userId;
  if (!userId) {
    throw new Error("User ID not found in token");
  }

  try {
    const response = await fetch(`${url}userId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch liked items");
    }

    const data = await response.json(); // { likedItems: [...] }

    if (!data.likedItems || !Array.isArray(data.likedItems)) {
      return [];
    }

    // Fetch all liked items in parallel
    const likedItemsDetails = await Promise.all(
      data.likedItems.map((itemId: string) =>
        artPieceService.getProductById(itemId)
      )
    );
    return likedItemsDetails;
  } catch (error) {
    console.error("Error fetching liked items:", error);
    throw new Error("Failed to fetch liked items");
  }
};

const getUsersCartItems = async (token: string) => {
  const url = `${process.env.NEXT_PUBLIC_GET_USERS_CART_URL}`;

  const decodedToken = decodeJWT(token);
  if (!decodedToken) {
    throw new Error("Invalid token");
  }

  const userId = decodedToken.userId;
  if (!userId) {
    throw new Error("User ID not found in token");
  }

  try {
    const response = await fetch(`${url}userId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch liked items");
    }

    const data = await response.json(); // { likedItems: [...] }

    if (!data.userCart || !Array.isArray(data.userCart)) {
      return [];
    }

    // Fetch all liked items in parallel
    const likedItemsDetails = await Promise.all(
      data.userCart.map((itemId: string) =>
        artPieceService.getProductById(itemId)
      )
    );
    // console.log("likedUserCart", likedItemsDetails);
    return likedItemsDetails;
  } catch (error) {
    console.error("Error fetching liked items:", error);
    throw new Error("Failed to fetch liked items");
  }
};

const toggleLikeItem = async (token: string, itemId: string) => {
  const url = `${process.env.NEXT_PUBLIC_USER_LIKES_ART_URL}`;

  if (!token) {
    throw new Error("Token is required");
  }

  const decodedToken = decodeJWT(token);

  if (!decodedToken) {
    throw new Error("Invalid token");
  }

  const userId = decodedToken.userId;

  if (!userId) {
    throw new Error("User ID not found in token");
  }

  if (!itemId) {
    throw new Error("Item ID is required");
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId,
        artPieceId: itemId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to toggle like item");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error toggling like item:", error);
    throw new Error("Failed to toggle like item");
  }
};

const toggleCartItem = async (token: string, itemId: string) => {
  const url = `${process.env.NEXT_PUBLIC_USER_ADDS_ART_TO_CART_URL}`;

  if (!token) {
    throw new Error("Token is required");
  }

  const decodedToken = decodeJWT(token);

  if (!decodedToken) {
    throw new Error("Invalid token");
  }

  const userId = decodedToken.userId;

  if (!userId) {
    throw new Error("User ID not found in token");
  }

  if (!itemId) {
    throw new Error("Item ID is required");
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId,
        artPieceId: itemId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to toggle like item");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error toggling like item:", error);
    throw new Error("Failed to toggle like item");
  }
};

const getUsersArtPieces = async (token: string) => {
  const userId = decodeJWT(token)?.userId;
  const url = `${process.env.NEXT_PUBLIC_GET_USERS_CREATED_ART_PIECES_URL}`;

  if (!token) {
    throw new Error("Token is required");
  }

  const decodedToken = decodeJWT(token);

  if (!decodedToken) {
    throw new Error("Invalid token");
  }

  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const response = await fetch(`${url}userId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user's art pieces");
    }

    const data = await response.json(); // { createdPieces: [...] }

    if (!data.createdPieces || !Array.isArray(data.createdPieces)) {
      return [];
    }

    // Fetch all art piece details in parallel and return the actual data
    const artPiecesDetails = await Promise.all(
      data.createdPieces.map((itemId: string) =>
        artPieceService.getProductById(itemId)
      )
    );
    return artPiecesDetails;
  } catch (error) {
    console.error("Error fetching user's art pieces:", error);
    throw new Error("Failed to fetch user's art pieces");
  }
};


const getAllUsers = async (token : string | null) => {
  const url = process.env.NEXT_PUBLIC_GET_ALL_USERS_URL_DASHBOARD;

  try {
    const response = await fetch(
      `${url}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    // console.log("Response from getAllProducts:", response);

    return await response.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
};

const deleteUser = async (userId: string, token: string) => {
  const url = process.env.NEXT_PUBLIC_DELETE_USER_URL;

  try {
    const response = await fetch(`${url}userId=${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete user");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user");
  }
};

const decodeJWT = (token: string) => {
  if (!token) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }

  const payload = parts[1];
  // Fix base64url to base64
  let base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  try {
    const decodedPayload = atob(base64);
    const userData = JSON.parse(decodedPayload);
    return userData;
  } catch (e) {
    console.error("Failed to decode JWT payload:", e);
    return null;
  }
};

function hello() {
  return "Hello from artPieceService!";
};

function getAllProducts() {
  return "Hello from artPieceService!";
}

const userService = {
  hello,
  getAllProducts,

  login,
  register,
  decodeJWT,
  getUsersLikedItems,
  getUsersCartItems,
  toggleLikeItem,
  toggleCartItem,
  getUsersArtPieces,
  getAllUsers,
  deleteUser
};

export default userService;
