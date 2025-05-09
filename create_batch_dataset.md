# Batch Creating a Dataset with Common Tags (Interactive Script)

This guide provides an interactive Python script to help you quickly create a Hugging Face dataset. It's designed for scenarios where you have a directory of audio files (e.g., `.wav`, `.mp3`) and want to assign a common set of descriptive tags to all of them, with empty lyrics.

The script will guide you through the process by asking questions in your terminal.

## Python Script for Interactive Batch Dataset Creation

The script below will:
1.  Ask for the location of your audio files.
2.  Scan the directory and report the number of audio files found.
3.  Ask if you want to apply common tags, and if so, which ones.
4.  Ask for your main ACE-Step project path.
5.  Ask for a name for your new dataset (this will become a subfolder in your ACE-Step project).
6.  Confirm before processing.
7.  Copy the audio files and create the Hugging Face dataset structure.

**Before running:**
*   Ensure you have the `datasets` library installed (`pip install datasets`).
*   Have your audio files ready in a single directory.

```python
from datasets import Dataset, DatasetDict
import os
import shutil  # For copying files
import uuid    # For generating unique keys

# Supported audio file extensions
SUPPORTED_EXTENSIONS = ['.wav', '.mp3', '.flac', '.ogg', '.m4a']

def get_valid_path(prompt_message, is_dir=True):
    """Prompts user for a path and validates it."""
    while True:
        path = input(prompt_message).strip()
        if is_dir:
            if os.path.isdir(path):
                return path
            else:
                print(f"Error: Directory not found at '{path}'. Please enter a valid directory path.")
        else: # for file (not used here but good for general utility)
            if os.path.isfile(path):
                return path
            else:
                print(f"Error: File not found at '{path}'. Please enter a valid file path.")
        retry = input("Try again? (yes/no): ").lower()
        if retry != 'yes':
            return None

def get_yes_no_input(prompt_message):
    """Gets a yes/no answer from the user."""
    while True:
        answer = input(prompt_message + " (yes/no): ").strip().lower()
        if answer in ['yes', 'y']:
            return True
        elif answer in ['no', 'n']:
            return False
        else:
            print("Invalid input. Please answer 'yes' or 'no'.")

def main():
    print("Welcome to the Interactive ACE-Step Dataset Creator!")
    print("This script will help you create a Hugging Face dataset from your audio files.")
    print("-" * 50)

    # 1. Get source audio directory
    source_audio_directory = get_valid_path(
        "Please provide the full path to the directory containing your audio files (e.g., D:/my_vocals/): "
    )
    if not source_audio_directory:
        print("No valid source audio directory provided. Exiting.")
        return

    # 2. Scan for audio files
    audio_files_to_process = []
    print(f"\nScanning for audio files in: {source_audio_directory}...")
    for filename in os.listdir(source_audio_directory):
        file_extension = os.path.splitext(filename)[1].lower()
        if file_extension in SUPPORTED_EXTENSIONS:
            audio_files_to_process.append(filename)
    
    if not audio_files_to_process:
        print("No supported audio files found in the specified directory. Exiting.")
        return
    print(f"Found {len(audio_files_to_process)} audio file(s): {', '.join(audio_files_to_process[:5])}{'...' if len(audio_files_to_process) > 5 else ''}")

    # 3. Get common tags
    common_tags = []
    if get_yes_no_input("\nDo you want to apply common tags to all audio samples?"):
        tags_input = input("Please enter the common tags, separated by commas (e.g., vocal, emotional, raw vocal): ").strip()
        if tags_input:
            common_tags = [tag.strip() for tag in tags_input.split(',') if tag.strip()]
            print(f"Selected tags: {common_tags}")
        else:
            print("No tags entered. Using empty tags list (ACE-Step will default to ['music'] if no tags).")
    else:
        print("No common tags will be applied (ACE-Step will default to ['music'] if no tags).")
        
    # Lyrics will be empty as per user request
    default_norm_lyrics = ""
    print("Lyrics for all entries will be empty.")

    # 4. Get ACE-Step project path
    ace_step_project_path = get_valid_path(
        "\nPlease provide the path to your main ACE-Step project directory (e.g., /home/user/ACE-Step/): "
    )
    if not ace_step_project_path:
        print("No valid ACE-Step project path provided. Exiting.")
        return

    # 5. Get dataset name
    while True:
        dataset_name = input("Please enter a name for your new dataset folder (e.g., my_vocal_samples): ").strip()
        if dataset_name:
            break
        else:
            print("Dataset name cannot be empty.")
            
    output_dataset_path = os.path.join(ace_step_project_path, dataset_name)
    hf_audio_dir = os.path.join(output_dataset_path, "audio")

    print("-" * 50)
    print("\nSummary of actions:")
    print(f"  - Source audio files from: {source_audio_directory}")
    print(f"  - Number of audio files to process: {len(audio_files_to_process)}")
    print(f"  - Common tags to apply: {common_tags if common_tags else 'None (will default to [\"music\"])'}")
    print(f"  - Lyrics: Empty for all entries")
    print(f"  - New Hugging Face dataset will be created at: {output_dataset_path}")
    print(f"  - Audio files will be copied into: {hf_audio_dir}")
    print("-" * 50)

    if not get_yes_no_input("Proceed with dataset creation?"):
        print("Dataset creation cancelled. Exiting.")
        return

    # Create output directories
    os.makedirs(hf_audio_dir, exist_ok=True)
    
    metadata_list = []
    audio_files_processed_count = 0

    print(f"\nProcessing and copying audio files...")
    for original_filename in audio_files_to_process:
        source_file_path = os.path.join(source_audio_directory, original_filename)
        file_extension = os.path.splitext(original_filename)[1].lower()
        
        unique_id = str(uuid.uuid4())
        new_audio_filename_in_hf = f"{unique_id}{file_extension}"
        destination_file_path = os.path.join(hf_audio_dir, new_audio_filename_in_hf)

        try:
            shutil.copy2(source_file_path, destination_file_path)
            
            entry = {
                "keys": unique_id,
                "filename": os.path.join("audio", new_audio_filename_in_hf).replace("\\", "/"),
                "tags": list(common_tags), # Use a copy
                "norm_lyrics": default_norm_lyrics,
                "speaker_emb_path": "", # Default empty
                "recaption": {} # Default empty
            }
            metadata_list.append(entry)
            audio_files_processed_count += 1
            # print(f"  Copied: {original_filename} -> {new_audio_filename_in_hf}")
        except Exception as e:
            print(f"  Error copying or processing {original_filename}: {e}")

    if not metadata_list:
        print("\nNo audio files were successfully processed. Dataset not created.")
        return

    print(f"\nSuccessfully processed and copied {audio_files_processed_count} audio files.")
    print("Creating Hugging Face dataset...")

    try:
        hf_dataset = Dataset.from_list(metadata_list)
        hf_dataset.save_to_disk(output_dataset_path)
        print(f"Hugging Face dataset saved to: {output_dataset_path}")
        print("\nDataset creation complete!")
        print(f"You can now use '{os.path.abspath(output_dataset_path)}' as --dataset_path in trainer.py.")
    except Exception as e:
        print(f"Error creating Hugging Face dataset: {e}")

if __name__ == "__main__":
    main()
```

## How to Use

1.  **Save the Script**: Copy the Python code above and save it as a `.py` file (e.g., `interactive_dataset_creator.py`) on your computer.
2.  **Ensure Dependencies**: Make sure you have the `datasets` library installed:
    ```bash
    pip install datasets
    ```
3.  **Run the Script**: Execute the script from your terminal:
    ```bash
    python interactive_dataset_creator.py
    ```
4.  **Answer Prompts**: The script will ask you for:
    *   The path to your directory containing the audio files.
    *   Whether you want to apply common tags, and if so, what those tags are (comma-separated).
    *   The path to your main ACE-Step project directory.
    *   A name for your new dataset folder.
5.  **Confirmation**: Review the summary and confirm to proceed.
6.  **Use the Dataset**: Once the script finishes, the new dataset directory (e.g., `Your_ACE-Step_Path/Your_Dataset_Name/`) will contain your Hugging Face dataset, ready to be used with the `--dataset_path` argument in the ACE-Step `trainer.py` script.

This interactive script should make the dataset creation process much easier for users who prefer not to modify Python code directly.
