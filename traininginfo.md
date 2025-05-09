# ACE-Step Model Training Guide

This document provides a comprehensive guide on preparing datasets, training the ACE-Step base model, and fine-tuning LoRA adaptations. Whether you're looking to train the model on your custom music library or specialize it for tasks like vocal generation, this guide aims to walk you through the process.

For general project information, installation, and usage of the pre-trained models, please refer to the main [README.md](README.md).

## 1. Prerequisites & Environment Setup

Before you begin training, ensure your environment is correctly set up.

*   **Python**: Version 3.10 or later is required.
*   **Virtual Environment (Recommended)**: Use Conda or `venv` to create an isolated environment.
    *   **Conda**:
        ```bash
        conda create -n ace_step python=3.10 -y
        conda activate ace_step
        ```
    *   **venv**:
        ```bash
        # In your project directory
        python -m venv venv
        # On Windows (cmd.exe)
        # venv\Scripts\activate.bat
        # On Windows (PowerShell)
        # .\venv\Scripts\Activate.ps1
        # On Linux / macOS
        # source venv/bin/activate
        ```
        (Refer to the main [README.md#3-set-up-a-virtual-environment](README.md:167) for more details on activating venv.)
*   **Clone Repository**: If you haven't already, clone the ACE-Step repository:
    ```bash
    git clone https://github.com/ace-step/ACE-Step.git
    cd ACE-Step
    ```
*   **Install Dependencies**:
    1.  (Windows Only with NVIDIA GPU) Install PyTorch with CUDA support first. For CUDA 12.6 (as used in Docker):
        ```bash
        pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu126
        ```
        Adjust `cu126` if you have a different CUDA version. See [PyTorch official website](https://pytorch.org/get-started/locally/).
    2.  Install ACE-Step and its core dependencies from [`requirements.txt`](requirements.txt):
        ```bash
        pip install -e .
        ```
    3.  For LoRA training, install the `peft` library:
        ```bash
        pip install peft
        ```
*   **CUDA**: The project's [`Dockerfile`](Dockerfile:1) uses CUDA 12.6. Ensure your local CUDA version, NVIDIA drivers, and PyTorch installation are compatible.
*   **Hardware**: Training deep learning models is computationally intensive. Refer to the [Hardware Performance](README.md:137) section in the main `README.md` for benchmarks. A powerful NVIDIA GPU is highly recommended.

## 2. Dataset Preparation

Proper dataset preparation is crucial for successful model training. ACE-Step expects datasets in the Hugging Face `datasets` format.

### 2.1. Understanding the Required Data Format

Your dataset should be structured as a collection of entries, where each entry is a dictionary (similar to a JSON object) containing the following fields:

*   `keys` (str): A unique identifier for each audio sample (e.g., `"song_001_chunk_01"`).
*   `filename` (str): The relative path to the audio file *within your Hugging Face dataset's audio directory*. For example, if your dataset is in `my_hf_dataset/` and audio files are in `my_hf_dataset/audio/`, this would be `"audio/sample.wav"`.
*   `tags` (List[str]): A list of descriptive tags for the music (e.g., `["pop", "upbeat", "female vocalist", "80s synth"]`).
*   `norm_lyrics` (str): The normalized lyrics for the audio, including structural tags like `[verse]`, `[chorus]`, `[bridge]`, `[intro]`, `[outro]`. Newlines (`\n`) should be used for line breaks.
*   `speaker_emb_path` (str, Optional): Path to a `.pt` file containing a pre-computed speaker embedding tensor for voice cloning. If not available or not applicable (e.g., instrumental music), use an empty string `""`. The training script [`acestep/text2music_dataset.py`](acestep/text2music_dataset.py:371-386) loads this file. Currently, this guide does not cover the creation of these embedding files; they need to be generated externally.
*   `recaption` (dict, Optional): A dictionary providing alternative textual descriptions for the audio, which can help in training for prompt diversity. Keys can be descriptive (e.g., `"simplified"`, `"descriptive"`, `"use_cases"`), and values are the corresponding text.
    *   Example:
        ```json
        {
          "simplified": "upbeat pop song",
          "descriptive": "A fast-paced pop song with a catchy synth melody and female vocals, reminiscent of 80s pop.",
          "use_cases": "Good for workout playlists or driving."
        }
        ```

**Example Dataset Entry (JSON-like):**

```json
{
    "keys": "1ce52937-cd1d-456f-967d-0f1072fcbb58",
    "filename": "audio/1ce52937-cd1d-456f-967d-0f1072fcbb58.wav",
    "tags": ["pop", "acoustic", "ballad", "romantic", "emotional"],
    "speaker_emb_path": "",
    "norm_lyrics": "[verse]\nI love you, I love you\n[chorus]\nI love you more than words can say",
    "recaption": {
        "simplified": "pop ballad",
        "expanded": "pop, acoustic, ballad, romantic, emotional",
        "descriptive": "The sound is soft and gentle, like a tender breeze on a quiet evening. It's soothing and full of longing.",
        "use_cases": "Suitable for background music in romantic films or during intimate moments.",
        "analysis": "pop, ballad, piano, guitar, slow tempo, romantic, emotional"
    }
}
```
(Adapted from [README.md](README.md:333-349))

### 2.2. Gathering and Placing Your Audio Data

1.  **Collect Your Audio**: Gather all your audio files (e.g., `.wav`, `.mp3`, etc.).
2.  **Organize Raw Audio**: It's good practice to place them in a dedicated directory on your system, for example, `~/my_music_project/raw_audio/`.
3.  **Audio File Requirements & Recommendations**:
    *   **Format**: While `torchaudio` (used by [`acestep/text2music_dataset.py`](acestep/text2music_dataset.py:401)) can load various formats, converting your audio to `.wav` (16-bit or 24-bit PCM) is recommended for consistency.
    *   **Sample Rate & Channels**: The script will automatically resample audio to 48kHz and convert mono to stereo ([`acestep/text2music_dataset.py:411-419`](acestep/text2music_dataset.py:411-419)). However, starting with good quality audio (e.g., 44.1kHz or 48kHz, stereo) is beneficial.
    *   **Duration**: The script pads audio to a minimum of 3 seconds ([`acestep/text2music_dataset.py:425-428`](acestep/text2music_dataset.py:425-428)). Very short audio clips might not be ideal unless padded significantly. Consider the `max_duration` parameter in `Text2MusicDataset` (default 240s).
    *   **Silence**: The script includes a silence check ([`acestep/text2music_dataset.py:21-38`](acestep/text2music_dataset.py:21-38), [`acestep/text2music_dataset.py:431-433`](acestep/text2music_dataset.py:431-433)) and will discard audio files that are mostly silent. Ensure your audio has meaningful content.
    *   **File Naming**: Use clear, consistent naming for your audio files.

### 2.3. Creating Metadata

For each audio file, you need to prepare the corresponding metadata:

*   **`tags`**: Create a list of relevant tags. Think about genre, mood, instruments, vocal characteristics, style, era, etc.
*   **`norm_lyrics`**: Transcribe or obtain the lyrics. Normalize them (e.g., consistent casing, punctuation) and add structural tags like `[verse]`, `[chorus]`. Ensure newlines (`\n`) are used for actual line breaks in the song.
*   **`speaker_emb_path`**: If you have speaker embeddings, note the path to the `.pt` file. If not, this will be an empty string.
*   **`recaption`**: Optionally, write different styles of descriptions for the audio.
*   **`keys`**: Assign a unique key to each entry.

**Tip**: You can initially organize this information in a spreadsheet (e.g., CSV). Columns could be: `audio_file_original_path`, `key`, `tags_comma_separated`, `lyrics_multiline`, `speaker_emb_relative_path`, `recaption_simplified`, `recaption_descriptive`. This makes it easier to manage before converting to the Hugging Face dataset format.

### 2.4. Structuring for Hugging Face Datasets

Once you have your audio files and metadata, you need to structure them into a Hugging Face dataset directory. This directory will be passed to the `--dataset_path` argument of the training script.

**Steps**:

1.  **Create Dataset Root Directory**: Make a new folder that will be your Hugging Face dataset.
    ```bash
    mkdir my_hf_dataset
    ```
2.  **Create Audio Subdirectory**: Inside this root directory, create an `audio` subdirectory.
    ```bash
    mkdir my_hf_dataset/audio
    ```
3.  **Copy (and Rename) Audio Files**: Copy your prepared audio files (preferably `.wav`) into the `my_hf_dataset/audio/` directory. Ensure their filenames match what you will use in the `filename` field of your metadata (e.g., `my_hf_dataset/audio/song1.wav`, `my_hf_dataset/audio/another_track.wav`).
4.  **Prepare Metadata List**: Create a Python list where each element is a dictionary representing one audio sample, structured as described in section 2.1. The `filename` field should be relative to `my_hf_dataset/`, e.g., `"audio/song1.wav"`.
5.  **Convert to Hugging Face Dataset and Save**: Use the following Python script template to convert your list of metadata dictionaries into a Hugging Face dataset and save it to disk.

    ```python
    from datasets import Dataset, DatasetDict
    import os

    # --- User Configuration ---
    # 1. Define the path where your Hugging Face dataset will be saved.
    #    This path will be used as --dataset_path in trainer.py
    output_dataset_path = "my_hf_dataset" # Create this directory if it doesn't exist

    # 2. Define the path to the directory where your actual audio .wav files are placed.
    #    This should be a subdirectory (e.g., "audio") inside output_dataset_path.
    #    The 'filename' field in your metadata should be relative to output_dataset_path.
    #    Example: if output_dataset_path is "my_hf_dataset" and audio is in "my_hf_dataset/audio",
    #    then a filename entry would be "audio/my_song.wav".
    #
    #    Ensure this directory exists and contains your audio files.
    #    os.makedirs(os.path.join(output_dataset_path, "audio"), exist_ok=True) # Done in step 2 above

    # 3. Prepare your metadata_list. Each item is a dictionary for one audio file.
    #    Ensure 'filename' paths are correct and audio files exist at those locations.
    metadata_list = [
        {
            "keys": "unique_song_001",
            "filename": "audio/song_001.wav", # Relative to output_dataset_path
            "tags": ["pop", "female vocalist", "upbeat"],
            "norm_lyrics": "[intro]\nYeah\n[verse 1]\nSun is shining bright today\nGonna chase the clouds away\n[chorus]\nOh what a beautiful feeling\nMy heart is up to the ceiling",
            "speaker_emb_path": "", # or "embeddings/speaker_A.pt" if you have them
            "recaption": {
                "simplified": "Upbeat pop song with female vocals.",
                "descriptive": "A cheerful and energetic pop track featuring a clear female lead vocal and a driving beat, perfect for a sunny day."
            }
        },
        {
            "keys": "instrumental_track_002",
            "filename": "audio/instrumental_002.wav", # Relative to output_dataset_path
            "tags": ["electronic", "ambient", "instrumental"],
            "norm_lyrics": "", # Empty if no lyrics
            "speaker_emb_path": "",
            "recaption": {
                "descriptive": "A calm and atmospheric electronic instrumental piece with evolving synth pads."
            }
        }
        # ... add more entries for all your audio files
    ]
    # --- End User Configuration ---

    if not metadata_list:
        print("Error: metadata_list is empty. Please populate it with your data.")
    else:
        print(f"Found {len(metadata_list)} entries in metadata_list.")

        # Validate that all audio files exist
        missing_files = []
        for item in metadata_list:
            full_audio_path = os.path.join(output_dataset_path, item["filename"])
            if not os.path.exists(full_audio_path):
                missing_files.append(full_audio_path)

        if missing_files:
            print("\nError: The following audio files listed in metadata_list are missing:")
            for f_path in missing_files:
                print(f"- {f_path}")
            print("\nPlease ensure all audio files are correctly placed and paths in metadata_list are accurate.")
        else:
            print("\nAll audio files found. Proceeding to create Hugging Face dataset.")
            # Create a Dataset object
            hf_dataset = Dataset.from_list(metadata_list)

            # You might want to split into train/validation here if you have enough data
            # For example, for a 90/10 split:
            # train_test_split = hf_dataset.train_test_split(test_size=0.1)
            # dataset_dict = DatasetDict({
            #     'train': train_test_split['train'],
            #     'test': train_test_split['test']
            # })
            # dataset_dict.save_to_disk(output_dataset_path)
            # print(f"Hugging Face dataset dictionary saved to {output_dataset_path}")

            # If not splitting, save the single dataset
            hf_dataset.save_to_disk(output_dataset_path)
            print(f"Hugging Face dataset saved to {output_dataset_path}")
            print("\nDataset creation complete. You can now use this path for --dataset_path in trainer.py.")

    ```
    Save this script (e.g., `create_hf_dataset.py`) and run it. It will create the necessary Hugging Face dataset files (like `dataset_info.json`, `state.json`, and `data-00000-of-00001.arrow`) inside your `my_hf_dataset` directory.

The `output_dataset_path` (e.g., `"my_hf_dataset"`) is what you will use for the `--dataset_path` argument when running [`trainer.py`](trainer.py).

### 2.5. Special Case: Training with Vocal-Only Samples

If your goal is to train a model specialized in vocals (e.g., for a "Lyric2Vocal" LoRA as mentioned in the [README.md](README.md:94-99)), adapt your dataset preparation:

*   **Audio Files**: Use clean, isolated vocal recordings.
*   **`tags`**: Emphasize tags like `"vocal"`, `"acapella"`, `"clean vocal"`, `"female vocal"`, `"male vocal"`, `"singing"`.
*   **`norm_lyrics`**: Provide accurate lyrics corresponding to the vocal recordings. The "Lyric2Vocal" functionality implies lyrics are a key input. If you have vocalizations without clear lyrics (e.g., humming, ad-libs), you'll need to decide how to represent this (e.g., descriptive text in lyrics field, or specific tags).
*   **`speaker_emb_path`**: This is highly relevant if your vocal dataset contains multiple singers and you want the model to learn to clone/differentiate voices. Prepare speaker embeddings for each distinct singer if possible.
*   **`recaption`**: Can be used to describe vocal style, emotion, etc.

## 3. Model Training

With your dataset prepared, you can proceed to train either the base model or a LoRA adaptation.

**General Advice**:
*   Start with LoRA training on a smaller, high-quality subset of your data to get familiar with the process and ensure your setup works.
*   Monitor your training logs and GPU utilization.

### 3.1. Base Model Training

Training a base model from scratch or further pre-training an existing one is resource-intensive and requires a very large, diverse dataset. This section assumes you are fine-tuning an existing ACE-Step checkpoint.

**3.1.a. Configuration & Parameters**

Key parameters for `trainer.py` when training a base model:

*   `--dataset_path`: Path to your Hugging Face dataset directory (e.g., `"my_hf_dataset"`).
*   `--checkpoint_dir`: Path to the directory containing the base ACE-Step model checkpoint you want to fine-tune.
*   `--learning_rate`: Learning rate (e.g., `1e-4`, `5e-5`). Default is `1e-4`.
*   `--max_steps`: Maximum number of training steps. Default is `2000000`.
*   `--precision`: Training precision (e.g., `"bf16-mixed"` (default), `"fp32"`). `bf16-mixed` is faster and uses less memory.
*   `--devices`: Number of GPUs to use (e.g., `1`, `2`). Default is `1`.
*   `--accumulate_grad_batches`: Number of batches to accumulate gradients over before an optimizer step. Default is `1`. Increases effective batch size.
*   `--num_workers`: Number of data loading workers. Default is `8`. Adjust based on your CPU cores and system.
*   `--every_n_train_steps`: How often to save a checkpoint. Default is `2000`.
*   `--every_plot_step`: How often to generate evaluation/sample audio. Default is `2000`.
*   `--exp_name`: Name for your experiment. Logs and checkpoints will be saved under `./exps/logs/{exp_name}` and `./exps/{exp_name}` respectively. Default is `"text2music_train_test"`.
*   `--logger_dir`: Directory for saving logs. Default is `"./exps/logs/"`.

**3.1.b. Commands (Linux & Windows)**

The basic command structure is:

```bash
python trainer.py \
    --dataset_path "path/to/your/hf_dataset" \
    --checkpoint_dir "path/to/base_model_checkpoint" \
    --exp_name "my_base_finetune_exp" \
    --learning_rate 5e-5 \
    --max_steps 100000 \
    --precision "bf16-mixed" \
    --devices 1 \
    --accumulate_grad_batches 4 \
    --every_n_train_steps 1000 \
    --every_plot_step 1000
```

*   **Linux Example**:
    ```bash
    python trainer.py \
        --dataset_path "./my_hf_dataset" \
        --checkpoint_dir "./path_to_downloaded_ace_step_checkpoint" \
        --exp_name "ace_step_base_finetune_run01" \
        --learning_rate 5e-5 \
        --max_steps 50000 \
        --devices 1
    ```

*   **Windows Example**:
    ```bash
    python trainer.py ^
        --dataset_path ".\my_hf_dataset" ^
        --checkpoint_dir ".\path_to_downloaded_ace_step_checkpoint" ^
        --exp_name "ace_step_base_finetune_run01" ^
        --learning_rate 5e-5 ^
        --max_steps 50000 ^
        --devices 1
    ```
    (Note the use of `^` for line continuation in Windows CMD, and `\` for paths. PowerShell uses `` ` `` for line continuation.)

### 3.2. LoRA Training

LoRA (Low-Rank Adaptation) is a more efficient way to fine-tune large models. It involves training smaller adapter layers.

**3.2.a. LoRA Configuration (`lora_config.json`)**

You need a LoRA configuration file (e.g., [`lora_config.json`](lora_config.json)) to specify which parts of the model to adapt and with what parameters.

Example [`lora_config.json`](lora_config.json) (from the repository):
```json
{
    "r": 16,
    "lora_alpha": 32,
    "target_modules": [
        "speaker_embedder",
        "linear_q",
        "linear_k",
        "linear_v",
        "to_q",
        "to_k",
        "to_v",
        "to_out.0"
    ]
}
```
*   `r`: The rank of the LoRA decomposition (a smaller number means fewer trainable parameters).
*   `lora_alpha`: A scaling factor for the LoRA weights. A common practice is to set `lora_alpha` to be twice `r`.
*   `target_modules`: A list of names of the modules within the transformer model where LoRA layers will be applied. The defaults target attention-related layers and the speaker embedder.

Start with the default configuration. You can create your own `my_lora_config.json` if you wish to experiment.

**3.2.b. Commands (Linux & Windows)**

In addition to the base model parameters, you need to specify `--lora_config_path`.

Basic command structure:
```bash
python trainer.py \
    --dataset_path "path/to/your/hf_dataset" \
    --checkpoint_dir "path/to/base_model_checkpoint" \
    --lora_config_path "path/to/your/lora_config.json" \
    --exp_name "my_lora_train_exp" \
    --learning_rate 1e-4 \
    --max_steps 20000 \
    --precision "bf16-mixed" \
    --devices 1 \
    --accumulate_grad_batches 2 \
    --every_n_train_steps 500 \
    --every_plot_step 500
```

*   **Linux Example**:
    ```bash
    python trainer.py \
        --dataset_path "./my_hf_dataset" \
        --checkpoint_dir "./path_to_downloaded_ace_step_checkpoint" \
        --lora_config_path "./lora_config.json" \
        --exp_name "my_pop_music_lora_run01" \
        --learning_rate 1e-4 \
        --max_steps 10000 \
        --devices 1
    ```

*   **Windows Example**:
    ```bash
    python trainer.py ^
        --dataset_path ".\my_hf_dataset" ^
        --checkpoint_dir ".\path_to_downloaded_ace_step_checkpoint" ^
        --lora_config_path ".\lora_config.json" ^
        --exp_name "my_pop_music_lora_run01" ^
        --learning_rate 1e-4 ^
        --max_steps 10000 ^
        --devices 1
    ```

**3.2.c. Example: Training a "Lyric2Vocal" LoRA**

To train a LoRA specialized for generating vocals from lyrics:
1.  **Dataset**: Prepare a dataset consisting of pure vocal audio tracks and their corresponding lyrics, as described in Section 2.5. Ensure `speaker_emb_path` is used if you have multiple singers and want voice cloning capabilities.
2.  **LoRA Configuration**: You can start with the default [`lora_config.json`](lora_config.json). The `target_modules` already include `speaker_embedder`, which is relevant.
3.  **Command**: Use the LoRA training command structure from above, pointing to your vocal-only dataset.
    *   Example (Linux):
        ```bash
        python trainer.py \
            --dataset_path "./my_vocal_dataset_hf" \
            --checkpoint_dir "./path_to_downloaded_ace_step_checkpoint" \
            --lora_config_path "./lora_config.json" \
            --exp_name "lyric2vocal_lora_v1" \
            --learning_rate 1e-4 \
            --max_steps 15000 \
            --devices 1 \
            --every_n_train_steps 500 \
            --every_plot_step 500
        ```

## 4. Monitoring Training & Checkpoints

*   **Logs**:
    *   Training progress, loss values, and other metrics are logged to the console and also saved in the directory specified by `--logger_dir` (default: `./exps/logs/`), under your `--exp_name`.
    *   These logs are typically compatible with TensorBoard. You can launch TensorBoard by running:
        ```bash
        tensorboard --logdir ./exps/logs/
        ```
        Then navigate to `http://localhost:6006` in your browser.
*   **Checkpoints**:
    *   Model checkpoints are saved periodically in a subdirectory within `./exps/` named after your `--exp_name`.
    *   The frequency of saving is controlled by `--every_n_train_steps`.
    *   For LoRA training, these checkpoints will contain the trained LoRA adapter weights.
*   **Generated Samples**:
    *   If `--every_plot_step` is set, the model will generate sample audio files at that interval during training. These are useful for qualitatively assessing training progress. They are typically saved within the experiment's output directory.

## 5. Advanced Training Options

The [`trainer.py`](trainer.py) script and the main [README.md](README.md:398-404) list several advanced parameters that control aspects of the flow matching process, gradient clipping, and data loading:

*   `--shift`: Flow matching shift parameter (default: 3.0).
*   `--gradient_clip_val`: Gradient clipping value (default: 0.5).
*   `--gradient_clip_algorithm`: Gradient clipping algorithm (default: "norm").
*   `--reload_dataloaders_every_n_epochs`: Frequency to reload dataloaders (default: 1).
*   `--val_check_interval`: Validation check interval (default: None).

It's recommended to start with the default values for these unless you have a deep understanding of their impact on the training dynamics.

## 6. Troubleshooting & FAQ

*   **CUDA Out of Memory**:
    *   Reduce batch size (implicitly by reducing `--devices` if using data parallelism, or by increasing `--accumulate_grad_batches` while keeping global batch size in mind).
    *   Use a lower precision like `"bf16-mixed"`.
    *   Reduce model size if applicable (e.g., smaller LoRA rank `r`).
    *   Ensure no other processes are consuming GPU memory.
*   **File Not Found Errors**:
    *   Double-check all paths provided in command-line arguments (`--dataset_path`, `--checkpoint_dir`, `--lora_config_path`).
    *   Ensure paths within your Hugging Face dataset's `filename` field are correct and relative to the dataset root.
*   **Slow Training**:
    *   Increase `--num_workers` if your CPU is a bottleneck for data loading (monitor CPU usage).
    *   Ensure you are using mixed precision (`--precision "bf16-mixed"`) if your GPU supports it.
    *   Check for I/O bottlenecks if loading data from a slow disk.
*   **"How many samples do I need for training?"**:
    *   **General Guidance**: More data is generally better, especially for base model training. For LoRA fine-tuning, you can achieve good results with smaller, high-quality, domain-specific datasets (e.g., a few hours of specific genre music or specific vocal data).
    *   **Quality over Quantity**: Clean, well-labeled data is more important than a massive amount of noisy data.
    *   Start with a modest dataset (e.g., 100-500 high-quality clips for LoRA) and scale up if needed.
*   **"How to resume training from a checkpoint?"**:
    *   PyTorch Lightning's `Trainer` typically handles resuming from the last saved checkpoint automatically if you re-run the same command with the same `--exp_name`.
    *   To explicitly resume, you might need to point `--checkpoint_dir` to the specific checkpoint file (e.g., `exps/my_lora_train_exp/checkpoints/epoch=X-step=Y.ckpt`) if the trainer doesn't pick it up, or use a `resume_from_checkpoint` argument if supported by the script (check `trainer.py --help`). *Self-correction: The current `trainer.py` doesn't explicitly show a `resume_from_checkpoint` argument in its `argparse` setup, but Lightning often has implicit ways. The most reliable way is to ensure `checkpoint_dir` for the *base model* is correct, and for continuing a previous run, ensure `exp_name` is the same so Lightning can find its own checkpoints.* For LoRA, the base model checkpoint is always needed, and the LoRA weights are applied on top. If a LoRA training was interrupted, restarting with the same `exp_name` should allow Lightning to load its last LoRA checkpoint.

This guide should provide a solid starting point for training your own ACE-Step models. Happy training!
