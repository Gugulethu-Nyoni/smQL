# Handling File Uploads in Semantq (using Formique, smQL, Form, and semantqQL)

This guide outlines the complete process for implementing file uploads, from the client-side component (`.smq` file) to server-side processing, following the exact flow established in the `semantqQL` framework.

## 1\. Client-Side Implementation (Semantq `.smq` Component)

The client code remains unchanged as it already uses the correct structure (`$onMount` and `Formique`/`smQL` helpers).

```javascript
// src/routes/product/@page.smq (or src/components/ProductUpload.smq)

@script
    import Formique from '@formique/semantq';
    import { smQL, Form } from '@semantq/smql'; // Adjusted import path for semantq environment
    // Modules for reference: [Semantq (Client)] | [Formique] | [smQL/Form]
    // https://github.com/Gugulethu-Nyoni/semantq | https://github.com/Gugulethu-Nyoni/formique | https://github.com/Gugulethu-Nyoni/smQL

    $onMount(async () => {
        const api = new smQL('http://localhost:3003');
        const productId = 'SKU-001';

        // --- Formique Setup ---
        const productSchema = [
            ['file', 'productfile', 'Upload Product Data File', { required: true }],
            ['hidden', 'productId', '', { value: productId }],
            ['submit', 'submit', 'Upload Product Data']
        ];
        const excelParams = { id: 'product-upload-form', enctype: 'multipart/form-data' };
        new Formique(productSchema, { themeColor: '#990000'}, excelParams);

            // --- Form Submission Handler ---
            new Form('product-upload-form', 'submit', {
                onCaptured: async ({ formData, hasFiles, data }) => {
                    const urlEndpoint = `/product/upload/${data.productId}`;
                    document.getElementById('submit').disabled = true;

                    try {
                        if (!hasFiles) throw new Error("Please select a file.");

                        const response = await api.post(urlEndpoint, formData);

                        if (response._ok) {
                            alert(`Upload successful! Processed ${response.count} records.`);
                            document.getElementById('product-upload-form').reset();
                        } else {
                            throw new Error(response.error || 'Server error during upload.');
                        }
                    } catch (error) {
                        console.error('Upload Failed:', error);
                        alert(`Upload Failed: ${error.message}`);
                    } finally {
                        document.getElementById('submit').disabled = false;
                    }
                }
            });
    });
@end

@html
<div id="formique"></div>
```

## 2\. Server-Side Setup (semantqQL)

The server-side implementation utilizes the exact middleware pattern established in the existing `semantqQL` environment for reliability.

### A. Route Definition (`productRoutes.js`)

This follows the two-step process: using the helper middleware to retrieve the Multer instance, and then executing its `.single()` method.

```javascript
// semantqQL/routes/productRoutes.js - ADHERING TO ESTABLISHED FLOW

import express from 'express';
import productController from '../controllers/productController.js';

const router = express.Router();

// --- Helper Middleware to retrieve Multer instance (Must exist in project) ---
const getUploadMiddleware = (req, res, next) => {
    // Retrieves the pre-configured Multer instance from req.app.get('uploadMiddleware')
    req.upload = req.app.get('uploadMiddleware');
    if (!req.upload) {
        console.error("Multer instance not found on Express app.");
        return res.status(500).json({ error: 'Server configuration error: File upload handler missing.' });
    }
    next();
};
// --- End Helper Middleware ---


// handle product file uploads
router.post(
    '/product/upload/:productId',
    getUploadMiddleware, // Step 1: Attach the Multer instance to req.upload
    (req, res, next) => {
        // Step 2: Execute .single() on the attached instance
        // 'productfile' MUST match the client-side input name.
        req.upload.single('productfile')(req, res, next);
    },
    productController.handleFileUpload
);

export default router;
```

### B. Controller (`productController.js`)

The Controller receives the request after Multer has placed the file details into `req.file`.

```javascript
// semantqQL/controllers/productController.js

import productService from '../services/productService.js';

const productController = {
    async handleFileUpload(req, res) {
        const file = req.file; 
        const productId = req.params.productId; 

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded or file name mismatch.' });
        }

        try {
            const result = await productService.processFile(file, productId);

            return res.status(200).json({
                message: 'File processing complete.',
                count: result.count,
            });
        } catch (error) {
            console.error('File processing error:', error);
            // The service/model is expected to handle file cleanup on error.
            return res.status(500).json({ error: 'Internal server error during file processing.' });
        }
    }
};

export default productController;
```

### C. Service Layer (`productService.js`)

Manages **business logic** and calls the model, delegating cleanup to the model.

```javascript
// semantqQL/services/productService.js

import ProductModel from '../models/Product.js';

const productService = {
    async processFile(file, productId) {
        if (!file || file.size === 0) {
            // Validate first, then ensure cleanup if validation fails
            await ProductModel.cleanupFile(file.path);
            throw new Error('Invalid or empty file received.');
        }

        // Delegate I/O and DB tasks to the Model
        const processCount = await ProductModel.bulkInsertFromFile(file, productId);

        return {
            count: processCount,
        };
    }
};

export default productService;
```

### D. Model Layer (`Product.js`)

Handles **low-level file I/O, database interaction, and mandatory file cleanup.**

```javascript
// semantqQL/models/Product.js

import fs from 'fs/promises'; 

const ProductModel = {
    
    // Core data processing function
    async bulkInsertFromFile(file, productId) {
        const tempFilePath = file.path;
        let processedCount = 0;

        try {
            // 1. Read File: Use tempFilePath to access and parse the file
            // 2. Database: Perform insertions
            
            processedCount = Math.floor(Math.random() * 100); 
            
            return processedCount;
        } catch (error) {
            console.error('File operation or DB insertion failed:', error);
            throw error; // Propagate error
        } finally {
            // 3. 🚨 CRITICAL CLEANUP: Call the cleanup function regardless of success/failure
            await this.cleanupFile(tempFilePath);
        }
    },
    
    // Dedicated function for file cleanup
    async cleanupFile(filePath) {
        if (filePath) {
            await fs.unlink(filePath).catch(e => 
                console.error(`Failed to delete temp file ${filePath}:`, e)
            );
        }
    }
};

export default ProductModel;
```

[smQL Docs](https://github.com/Gugulethu-Nyoni/smql)