#!/usr/bin/env python
import json
import os
import sys
import pandas as pd


def convert_excel_to_json(excel_file, output_file=None):
    """
    Reads an Excel file containing skills and converts it to a JSON array of skills.
    
    Args:
        excel_file: Path to the Excel file containing skills
        output_file: Optional path for the output JSON file. If None, prints to stdout
    
    Returns:
        List of skill names
    """
    try:
        print(f"Reading Excel file: {excel_file}")
        # Read the Excel file
        df = pd.read_excel(excel_file)
        print(f"Excel file read successfully. Shape: {df.shape}")
        print(f"Columns: {df.columns.tolist()}")
        
        # Check if the dataframe is empty
        if df.empty:
            print(f"The Excel file {excel_file} is empty.")
            return []
        
        # Get the first column name
        first_column = df.columns[0]
        
        # Extract skills from the first column
        skills = df[first_column].dropna().tolist()
        
        # Remove any duplicates and sort alphabetically
        skills = sorted(list(set(skills)))
        
        # Convert to JSON
        skills_json = json.dumps(skills, indent=2)
        
        # Save to file or print to stdout
        if output_file:
            with open(output_file, 'w') as f:
                f.write(skills_json)
            print(f"Skills saved to {output_file}")
        else:
            print(skills_json)
        
        return skills
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return []


if __name__ == "__main__":
    # Parse command-line arguments
    if len(sys.argv) < 2:
        print("Usage: python convert_skills_to_json.py <excel_file> [output_json_file]")
        sys.exit(1)
    
    excel_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    # Check if the Excel file exists
    if not os.path.exists(excel_file):
        print(f"Error: File {excel_file} not found.")
        sys.exit(1)
    
    # Convert Excel to JSON
    convert_excel_to_json(excel_file, output_file)
