const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    items: [
        {
            foodId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'FoodItem'
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],
    totalAmount: {
        type: Number,
        required: true,
        default: 0.0
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'preparing', 'delivered', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    idempotencyKey: {
        type: String,
        unique: true,
        sparse: true // Only if provided
    },
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    paymentId: {
        type: String
    },
    paymentSignature: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false,
        select: false
    },
    deletedAt: {
        type: Date
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    paymentGateway: {
        type: String
    }
}, {
    timestamps: true
});

// Global filter for soft delete
orderSchema.pre(/^find/, function() {
    this.where({ isDeleted: { $ne: true } });
});

// Indexes for performance
orderSchema.index({ userId: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
