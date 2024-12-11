import AddressModel from "../models/Address.js";

class AddressController {
    // Add new address
    static addAddress = async (req, res) => {
        const { addressLine1, addressLine2, city, state, country, postalCode } = req.body;

        try {
            let userAddress = await AddressModel.findOne({ user: req.user._id });

            if (!userAddress) {
                userAddress = new AddressModel({
                    user: req.user._id,
                    addresses: []
                });
            }

            userAddress.addresses.push({
                addressLine1,
                addressLine2,
                city,
                state,
                country,
                postalCode
            });

            await userAddress.save();
            res.status(201).json({ message: "Address added successfully", addresses: userAddress.addresses });
        } catch (error) {
            res.status(500).json({ error: "Failed to add address" });
        }
    }

    // Edit an existing address
    static editAddress = async (req, res) => {
        const { addressId } = req.params;
        const { addressLine1, addressLine2, city, state, country, postalCode } = req.body;

        try {
            const userAddress = await AddressModel.findOne({ user: req.user._id });

            if (!userAddress) {
                return res.status(404).json({ message: "Address not found" });
            }

            const addressIndex = userAddress.addresses.findIndex(address => address._id.toString() === addressId);

            if (addressIndex === -1) {
                return res.status(404).json({ message: "Address not found" });
            }

            userAddress.addresses[addressIndex] = {
                _id: addressId, // Keep the same address ID
                addressLine1,
                addressLine2,
                city,
                state,
                country,
                postalCode
            };

            await userAddress.save();
            res.status(200).json({ message: "Address updated successfully", addresses: userAddress.addresses });
        } catch (error) {
            res.status(500).json({ error: "Failed to update address" });
        }
    }

    // Delete an address
    static deleteAddress = async (req, res) => {
        const { addressId } = req.params;

        try {
            const userAddress = await AddressModel.findOne({ user: req.user._id });

            if (!userAddress) {
                return res.status(404).json({ message: "Address not found" });
            }

            const addressIndex = userAddress.addresses.findIndex(address => address._id.toString() === addressId);

            if (addressIndex === -1) {
                return res.status(404).json({ message: "Address not found" });
            }

            userAddress.addresses.splice(addressIndex, 1);
            await userAddress.save();

            res.status(200).json({ message: "Address deleted successfully", addresses: userAddress.addresses });
        } catch (error) {
            res.status(500).json({ error: "Failed to delete address" });
        }
    }
}

export default AddressController;