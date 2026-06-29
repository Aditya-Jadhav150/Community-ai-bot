# Deploy script for Google Cloud Run (Windows PowerShell)

Write-Host "Starting Google Cloud Run Deployment..." -ForegroundColor Cyan

# Check if gcloud is installed
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: gcloud CLI is not installed or not in your PATH." -ForegroundColor Red
    Write-Host "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
}

$PROJECT_ID = gcloud config get-value project 2>$null
if (-not $PROJECT_ID) {
    Write-Host "ERROR: No Google Cloud Project configured." -ForegroundColor Red
    Write-Host "Run 'gcloud init' or 'gcloud config set project YOUR_PROJECT_ID' first."
    exit 1
}

Write-Host "Deploying to Project: $PROJECT_ID" -ForegroundColor Green
Write-Host "Submitting build to Cloud Build and deploying to Cloud Run..."

# Deploy command
# --source . will build the Docker container using Cloud Build automatically
# --allow-unauthenticated ensures it's publicly accessible on the web
gcloud run deploy community-hero-ai `
    --source . `
    --region us-central1 `
    --allow-unauthenticated `
    --port 3000 `
    --min-instances 0 `
    --max-instances 5

Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "Don't forget to set your GEMINI_API_KEY and NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in the Cloud Run Console (Revisions -> Variables & Secrets) if you haven't already!" -ForegroundColor Yellow
