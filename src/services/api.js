import axios from "axios";

const API = axios.create({
    baseURL: "http://127.0.0.1:8000",
});

// Automatically attach token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => {
    const formData = new FormData();
    formData.append("username", data.email);
    formData.append("password", data.password);
    return API.post("/auth/login", formData);
};

// Business
export const createBusiness = (data) => API.post("/businesses/", data);
export const getMyBusinesses = () => API.get("/businesses/my-businesses");
export const getBusiness = (id) => API.get(`/businesses/${id}`);
export const updateBusiness = (id, data) => API.put(`/businesses/${id}`, data);
export const deleteBusiness = (id) => API.delete(`/businesses/${id}`);

// Valuation
export const createValuation = (data) => API.post("/valuations/", data);
export const getValuationsForBusiness = (id) => API.get(`/valuations/business/${id}`);

// Marketplace
export const createListing = (data) => API.post("/marketplace/listings", data);
export const getListings = () => API.get("/marketplace/listings");
export const getMyListings = () => API.get("/marketplace/listings/my-listings");
export const makeOffer = (data) => API.post("/marketplace/offers", data);
export const getMyOffers = () => API.get("/marketplace/offers/my-offers");
export const getReceivedOffers = () => API.get("/marketplace/offers/received");
export const updateOffer = (id, data) => API.put(`/marketplace/offers/${id}`, data);
export const sendMessage = (data) => API.post("/marketplace/messages", data);
export const getMessages = () => API.get("/marketplace/messages");

// Reports
export const getDashboard = () => API.get("/reports/dashboard");
export const getMarketplacePerformance = () => API.get("/reports/marketplace-performance");
export const getValuationHistory = (id) => API.get(`/reports/valuation-history/${id}`);

// Admin
export const getAdminStats = () => API.get("/admin/stats");
export const getAllUsers = () => API.get("/admin/users");
export const toggleUserStatus = (id) => API.put(`/admin/users/${id}/toggle-status`);
export const verifyUser = (id) => API.put(`/admin/users/${id}/verify`);

// Deal Rooms
export const createDealRoom   = (offerId) => API.post(`/deal-rooms/create/${offerId}`);
export const getMyDealRooms   = () => API.get("/deal-rooms/my-deals");
export const getDealRoom      = (id) => API.get(`/deal-rooms/${id}`);
export const getDealRoomByOffer = (offerId) => API.get(`/deal-rooms/by-offer/${offerId}`);
export const updateDealStage = (id, stage, closed_amount = null) =>
  API.put(`/deal-rooms/${id}/stage`, { stage, closed_amount });
export const acknowledgeNDA   = (id) => API.put(`/deal-rooms/${id}/acknowledge-nda`);
export const uploadDocument   = (id, filename, file_type, description) =>
  API.post(`/deal-rooms/${id}/documents?filename=${encodeURIComponent(filename)}&file_type=${file_type}`, { description });
export const toggleChecklist  = (dealId, itemId) => API.put(`/deal-rooms/${dealId}/checklist/${itemId}`);
export const addChecklistItem = (dealId, item) => API.post(`/deal-rooms/${dealId}/checklist`, { item });

// Advisors
export const getAvailableAdvisors = () => API.get("/deal-rooms/advisors/available");
export const assignAdvisor = (dealId, advisorId) =>
  API.put(`/deal-rooms/${dealId}/assign-advisor?advisor_id=${advisorId}`);