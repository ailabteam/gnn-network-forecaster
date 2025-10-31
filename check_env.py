# check_env.py
import torch
import torch_geometric

def run_environment_check():
    """
    Kiểm tra toàn diện môi trường PyTorch và PyTorch Geometric.
    """
    print("--- Starting Environment Check ---")

    # === 1. Kiểm tra PyTorch và GPU ===
    print("\n[Step 1/3] Checking PyTorch and CUDA...")
    try:
        print(f"PyTorch version: {torch.__version__}")
        
        is_cuda_available = torch.cuda.is_available()
        print(f"CUDA available: {is_cuda_available}")

        if not is_cuda_available:
            print("❌ ERROR: PyTorch cannot find CUDA. GPU acceleration will not be available.")
            print("--- Check Failed ---")
            return

        gpu_count = torch.cuda.device_count()
        print(f"Number of GPUs found: {gpu_count}")
        
        for i in range(gpu_count):
            print(f"  - GPU {i}: {torch.cuda.get_device_name(i)}")

        # Chọn GPU đầu tiên làm thiết bị mặc định
        device = torch.device("cuda:0")
        print(f"Selected device: {device}")

    except Exception as e:
        print(f"❌ ERROR during PyTorch check: {e}")
        print("--- Check Failed ---")
        return

    # === 2. Kiểm tra PyTorch Geometric ===
    print("\n[Step 2/3] Checking PyTorch Geometric...")
    try:
        print(f"PyTorch Geometric version: {torch_geometric.__version__}")
        print("✅ PyTorch Geometric imported successfully.")
    except Exception as e:
        print(f"❌ ERROR during PyTorch Geometric check: {e}")
        print("--- Check Failed ---")
        return

    # === 3. Kiểm tra Tích hợp: Tạo đồ thị và chuyển lên GPU ===
    print("\n[Step 3/3] Testing GPU integration with a PyG Data object...")
    try:
        # Tạo một đồ thị đơn giản: 3 nút, 4 cạnh
        # Cạnh: 0->1, 1->0, 1->2, 2->1
        edge_index = torch.tensor([[0, 1, 1, 2],
                                   [1, 0, 2, 1]], dtype=torch.long)

        # Mỗi nút có 2 thuộc tính (features)
        x = torch.tensor([[-1, 1], [0, 0], [1, -1]], dtype=torch.float)

        # Tạo đối tượng Data của PyG
        data = torch_geometric.data.Data(x=x, edge_index=edge_index)
        print("Created a sample PyG Data object on CPU:")
        print(data)

        # Chuyển đối tượng Data lên GPU
        data_on_gpu = data.to(device)
        print(f"\nSuccessfully moved Data object to GPU ({device}):")
        print(data_on_gpu)
        
        # Kiểm tra xem các tensor bên trong có thực sự nằm trên GPU không
        if data_on_gpu.x.is_cuda and data_on_gpu.edge_index.is_cuda:
            print("\n✅ SUCCESS: All tensors in the Data object are on the GPU.")
        else:
            print("\n❌ ERROR: Failed to move all tensors to the GPU.")
            print("--- Check Failed ---")
            return

    except Exception as e:
        print(f"❌ ERROR during GPU integration test: {e}")
        print("--- Check Failed ---")
        return

    print("\n--- ✅ All Checks Passed Successfully! Environment is ready for GNN development. ---")

if __name__ == "__main__":
    run_environment_check()
