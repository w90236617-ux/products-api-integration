import axiosInstance from "./axiosInstance"

export const getProducts = async () => {
    const response = await axiosInstance.get("/products?limit=0") // saare products
    return response.data
}

export const getProductById = async (id) => {
    const response = await axiosInstance.get(`/products/${id}`)
    return response.data
}