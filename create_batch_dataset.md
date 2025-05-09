# Batch Creating a Dataset with Common Tags

This guide provides a Python script to help you quickly create a Hugging Face dataset when you have a directory of audio files (e.g., `.wav`, `.mp3`) that should all share a common set of descriptive tags. This is useful, for example, if you have a collection of vocal samples and want to tag them all as `"vocal"` and `"emotional"`.

## Python Script for Batch Dataset Creation

The script below will:
1.  Scan a specified directory for audio files.
2.  For each audio file, create a metadata entry.
3.  Assign a common set of tags (that you define) to every entry.
4.  Use a default lyric string (that you define, can be empty) for every entry.
5.  Generate unique keys for each entry.
6.  Save the collection as a Hugging Face dataset.

**Before running:**
*   Ensure you have the `datasets` library installed (`pip install datasets`).
*   Place all your audio files (e.g., `audio1.wav`, `sample.mp3`) directly into the audio source directory you specify (e.g., `my_audio_files_for_dataset/`). The script will then copy these into the `audio/` subfolder of your new Hugging Face dataset.

```python
from datasets import Dataset, DatasetDict
import os
import shutil # For copying files
import uuid   # For generating unique keys

# --- User Configuration ---

# 1. Path to the directory where your raw audio files are currently located.
#    Example: "D:/my_vocal_samples/" or "./downloaded_instrumentals/"
source_audio_directory = "path/to/your/raw_audio_files/"

# 2. Path where the new Hugging Face dataset will be created.
#    This directory will be created if it doesn't exist.
#    Example: "./my_hf_vocal_dataset"
output_dataset_path = "my_new_hf_dataset"

# 3. Common tags to apply to ALL audio files in this dataset.
#    Example: ["vocal", "female", "pop"] or ["instrumental", "ambient", "synth"]
common_tags = ["emotional", "vocal"] # MODIFY THIS

# 4. Default normalized lyrics to apply to ALL audio files.
#    Can be an empty string if lyrics are not applicable or not available.
#    Example: "[instrumental]" or "" or "[verse]\nLa la la"
default_norm_lyrics = "" # MODIFY THIS (e.g., "[vocal sample]" or leave empty)

# 5. Default speaker embedding path (optional).
#    Leave as "" if not used.
default_speaker_emb_path = ""

# 6. Default recaption dictionary (optional).
#    Leave as {} if not used.
default_recaption = {
    "simplified": "A vocal sample with an emotional quality." # MODIFY THIS if needed
}

# 7. Supported audio file extensions to look for.
supported_extensions = ['.wav', '.mp3', '.flac', '.ogg', '.m4a']

# --- End User Configuration ---

def create_batch_dataset():
    if not os.path.isdir(source_audio_directory):
        print(f"Error: Source audio directory not found: {source_audio_directory}")
        return

    # Create the output dataset directory and its 'audio' subdirectory
    hf_audio_dir = os.path.join(output_dataset_path, "audio")
    os.makedirs(hf_audio_dir, exist_ok=True)
    print(f"Hugging Face dataset will be created at: {output_dataset_path}")
    print(f"Audio files will be copied to: {hf_audio_dir}")

    metadata_list = []
    audio_files_processed = 0

    print(f"\nScanning for audio files in: {source_audio_directory}...")
    for filename in os.listdir(source_audio_directory):
        file_extension = os.path.splitext(filename)[1].lower()
        if file_extension in supported_extensions:
            source_file_path = os.path.join(source_audio_directory, filename)
            
            # Define a new filename for the HF dataset to avoid potential conflicts
            # and ensure clean names. Using UUID for uniqueness.
            unique_id = str(uuid.uuid4())
            new_audio_filename = f"{unique_id}{file_extension}"
            destination_file_path = os.path.join(hf_audio_dir, new_audio_filename)

            try:
                shutil.copy2(source_file_path, destination_file_path) # Copy the audio file
                
                entry = {
                    "keys": unique_id, # Use the unique part of the new filename as key
                    "filename": os.path.join("audio", new_audio_filename).replace("\\", "/"), # Relative path for HF dataset
                    "tags": list(common_tags), # Ensure it's a copy
                    "norm_lyrics": default_norm_lyrics,
                    "speaker_emb_path": default_speaker_emb_path,
                    "recaption": dict(default_recaption) # Ensure it's a copy
                }
                metadata_list.append(entry)
                audio_files_processed += 1
                print(f"  Processed and copied: {filename} -> {new_audio_filename}")
            except Exception as e:
                print(f"  Error copying or processing {filename}: {e}")


    if not metadata_list:
        print("\nNo audio files found or processed in the source directory.")
        return

    print(f"\nProcessed a total of {audio_files_processed} audio files.")
    print("Creating Hugging Face dataset...")

    try:
        hf_dataset = Dataset.from_list(metadata_list)
        # If you want to create train/test splits, you can do it here:
        # train_test_split = hf_dataset.train_test_split(test_size=0.1)
        # dataset_dict = DatasetDict({'train': train_test_split['train'], 'test': train_test_split['test']})
        # dataset_dict.save_to_disk(output_dataset_path)
        # print(f"Hugging Face dataset dictionary saved to {output_dataset_path}")
        
        # For a single split (e.g., all 'train'):
        hf_dataset.save_to_disk(output_dataset_path)
        print(f"Hugging Face dataset (single split) saved to {output_dataset_path}")
        print("\nDataset creation complete!")
        print(f"You can now use '{os.path.abspath(output_dataset_path)}' as --dataset_path in trainer.py.")

    except Exception as e:
        print(f"Error creating Hugging Face dataset: {e}")

if __name__ == "__main__":
    # IMPORTANT: Before running, modify the User Configuration section above!
    # For example:
    # source_audio_directory = "D:/my_vocals_collection/"
    # output_dataset_path = "./hf_emotional_vocals"
    # common_tags = ["vocal", "emotional", "female"]
    # default_norm_lyrics = "[lyric unavailable]"

    create_batch_dataset()
```

## How to Use

1.  **Save the Script**: Copy the Python code above and save it as a `.py` file (e.g., `batch_dataset_script.py`) on your computer.
2.  **Configure**: Open the script and modify the variables in the "User Configuration" section:
    *   `source_audio_directory`: Set this to the full path of the folder containing your raw audio files.
    *   `output_dataset_path`: Set this to the desired path where your new Hugging Face dataset will be created.
    *   `common_tags`: Update this list with the tags you want to apply to all files.
    *   `default_norm_lyrics`: Set the default lyrics string.
    *   `default_speaker_emb_path` (optional).
    *   `default_recaption` (optional).
    *   `supported_extensions`: Modify if you have other audio formats.
3.  **Place Audio Files**: Ensure all your audio files are directly inside the `source_audio_directory`.
4.  **Run the Script**: Execute the script from your terminal:
    ```bash
    python batch_dataset_script.py
    ```
5.  **Use the Dataset**: Once the script finishes, the `output_dataset_path` directory will contain your Hugging Face dataset, ready to be used with the `--dataset_path` argument in the ACE-Step `trainer.py` script.

This script provides a more automated way to prepare datasets for specific scenarios where uniform metadata is applicable. Remember to adjust the audio processing within the ACE-Step training pipeline (like `max_duration`) if your audio samples have specific length characteristics.
