// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

/**
 * @title DocumentVerification
 * @dev Smart Contract để xác thực tài liệu thông qua hash và lưu trữ metadata trên blockchain
 */
contract DocumentVerification {
    
    // Struct để lưu thông tin tài liệu
    struct Document {
        bytes32 documentHash;      // SHA-256 hash của tài liệu
        string ipfsCID;            // IPFS Content Identifier
        address uploader;          // Địa chỉ người upload
        uint256 timestamp;         // Thời gian upload
        string metadata;           // Metadata bổ sung (tên file, mô tả, etc.)
        bool exists;               // Flag kiểm tra tài liệu có tồn tại
    }
    
    // mapping: là map bytes32(sha256 có 32 bytes) vào struct Documents
    // Ví dụ : hash1 → {ipfsCID: "Qm1...", uploader: Alice, ...} => Để mỗi hashvalue CHỈ map với 1 document
    // Mapping: hash -> Document
    mapping(bytes32 => Document) private documents;
    
    // địa chỉ ví(address) => bytes32(hashvalue) : để mỗi address sẽ tìm được các hashvalue(tài liệu) cần tìm)
    // Mapping: uploader -> danh sách hash của họ
    mapping(address => bytes32[]) private uploaderDocuments;
    
    // Array lưu tất cả hash (để duyệt nếu cần)
    bytes32[] private allDocumentHashes;
    
    // Events
    // Cài đặt cấu trúc logging(log vào blockchain)
    event DocumentRecorded(
        bytes32 indexed documentHash, // searchable
        string ipfsCID,
        address indexed uploader,
        uint256 timestamp,
        bytes32 indexed txHash
    );
    
    event DocumentVerified(
        bytes32 indexed documentHash,
        address indexed verifier,
        bool isValid,
        uint256 timestamp
    );
    
    // Modifiers : tạo ra các rule để verify các hash
    modifier onlyExistingDocument(bytes32 _hash) {
        require(documents[_hash].exists, "Document does not exist");
        _; // run the rest of the function
    }
    
    modifier onlyNewDocument(bytes32 _hash) {
        require(!documents[_hash].exists, "Document already exists");
        _;
    }
    
    /**
     * @dev Upload tài liệu mới lên blockchain
     * @param _documentHash SHA-256 hash của tài liệu (bytes32)
     * @param _ipfsCID IPFS Content ID
     * @param _metadata Metadata bổ sung (JSON string hoặc plain text)
     */
    function uploadDocument(
        bytes32 _documentHash,
        string memory _ipfsCID,
        string memory _metadata
    ) public onlyNewDocument(_documentHash) {
        require(_documentHash != bytes32(0), "Invalid document hash");
        require(bytes(_ipfsCID).length > 0, "IPFS CID cannot be empty");
        
        // Tạo document mới
        Document memory newDoc = Document({
            documentHash: _documentHash,
            ipfsCID: _ipfsCID,
            uploader: msg.sender,
            timestamp: block.timestamp,
            metadata: _metadata,
            exists: true
        });
        
        // Lưu vào mapping
        documents[_documentHash] = newDoc;
        
        // Lưu vào danh sách của uploader
        uploaderDocuments[msg.sender].push(_documentHash);
        
        // Lưu vào danh sách tổng
        allDocumentHashes.push(_documentHash);
        
        // Emit event với txHash (block.timestamp dùng làm pseudo txHash)
        emit DocumentRecorded(
            _documentHash,
            _ipfsCID,
            msg.sender,
            block.timestamp,
            keccak256(abi.encodePacked(_documentHash, msg.sender, block.timestamp))
        );
    }
    
    /**
     * @dev Xác thực tài liệu bằng hash
     * @param _documentHash Hash cần kiểm tra
     * @return isValid Tài liệu có tồn tại và hợp lệ không
     * @return ipfsCID IPFS CID nếu tìm thấy
     * @return uploader Địa chỉ người upload
     * @return timestamp Thời gian upload
     * @return metadata Metadata của tài liệu
     */
    function verifyDocument(bytes32 _documentHash) 
        public 
        returns (
            bool isValid,
            string memory ipfsCID,
            address uploader,
            uint256 timestamp,
            string memory metadata
        ) 
    {
        Document memory doc = documents[_documentHash];
        
        isValid = doc.exists;
        
        if (isValid) {
            ipfsCID = doc.ipfsCID;
            uploader = doc.uploader;
            timestamp = doc.timestamp;
            metadata = doc.metadata;
        }
        
        // Emit event để tracking
        emit DocumentVerified(_documentHash, msg.sender, isValid, block.timestamp);
        
        return (isValid, ipfsCID, uploader, timestamp, metadata);
    }
    
    /**
     * @dev Lấy thông tin tài liệu (view function - không tốn gas)
     * @param _documentHash Hash cần tra cứu
     */
    function getDocument(bytes32 _documentHash) 
        public 
        view 
        onlyExistingDocument(_documentHash)
        returns (
            string memory ipfsCID,
            address uploader,
            uint256 timestamp,
            string memory metadata
        ) 
    {
        Document memory doc = documents[_documentHash];
        return (doc.ipfsCID, doc.uploader, doc.timestamp, doc.metadata);
    }
    
    /**
     * @dev Kiểm tra tài liệu có tồn tại không (view function)
     * @param _documentHash Hash cần kiểm tra
     */
    function documentExists(bytes32 _documentHash) public view returns (bool) {
        return documents[_documentHash].exists;
    }
    
    /**
     * @dev Lấy danh sách hash của một uploader
     * @param _uploader Địa chỉ uploader
     */
    function getDocumentsByUploader(address _uploader) 
        public 
        view 
        returns (bytes32[] memory) 
    {
        return uploaderDocuments[_uploader];
    }
    
    /**
     * @dev Lấy tổng số tài liệu đã upload
     */
    function getTotalDocuments() public view returns (uint256) {
        return allDocumentHashes.length;
    }
    
    /**
     * @dev Lấy hash tài liệu theo index (để pagination)
     * @param _index Index trong array
     */
    function getDocumentHashByIndex(uint256 _index) 
        public 
        view 
        returns (bytes32) 
    {
        require(_index < allDocumentHashes.length, "Index out of bounds");
        return allDocumentHashes[_index];
    }
    
    /**
     * @dev Lấy danh sách tài liệu với pagination
     * @param _offset Vị trí bắt đầu
     * @param _limit Số lượng tối đa
     */
    function getDocumentsPaginated(uint256 _offset, uint256 _limit)
        public
        view
        returns (bytes32[] memory hashes, uint256 total)
    {
        total = allDocumentHashes.length;
        
        if (_offset >= total) {
            return (new bytes32[](0), total);
        }
        
        uint256 end = _offset + _limit;
        if (end > total) {
            end = total;
        }
        
        uint256 size = end - _offset;
        hashes = new bytes32[](size);
        
        for (uint256 i = 0; i < size; i++) {
            hashes[i] = allDocumentHashes[_offset + i];
        }
        
        return (hashes, total);
    }
}