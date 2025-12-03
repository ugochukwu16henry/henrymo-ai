# Initialize Module Registry
# Registers all existing modules in the Central Motherboard System

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Initializing Module Registry" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$modules = @(
    @{
        name = "authentication"
        version = "1.0.0"
        dependencies = @()
        metadata = @{
            description = "User authentication and authorization"
            category = "core"
        }
    },
    @{
        name = "conversations"
        version = "1.0.0"
        dependencies = @("authentication")
        metadata = @{
            description = "AI conversation management"
            category = "ai"
        }
    },
    @{
        name = "memory"
        version = "1.0.0"
        dependencies = @("conversations")
        metadata = @{
            description = "AI memory system with vector embeddings"
            category = "ai"
        }
    },
    @{
        name = "code-analysis"
        version = "1.0.0"
        dependencies = @("ai")
        metadata = @{
            description = "Code analysis and security scanning"
            category = "ai"
        }
    },
    @{
        name = "debugging"
        version = "1.0.0"
        dependencies = @("code-analysis")
        metadata = @{
            description = "Intelligent debugging assistant"
            category = "ai"
        }
    },
    @{
        name = "media-generation"
        version = "1.0.0"
        dependencies = @("file-storage")
        metadata = @{
            description = "Image and video generation"
            category = "media"
        }
    },
    @{
        name = "file-storage"
        version = "1.0.0"
        dependencies = @()
        metadata = @{
            description = "AWS S3 file storage"
            category = "storage"
        }
    },
    @{
        name = "streets-platform"
        version = "1.0.0"
        dependencies = @("file-storage", "authentication")
        metadata = @{
            description = "Crowdsourced street mapping"
            category = "content"
        }
    },
    @{
        name = "admin-system"
        version = "1.0.0"
        dependencies = @("authentication")
        metadata = @{
            description = "Multi-level admin management"
            category = "enterprise"
        }
    },
    @{
        name = "financial-system"
        version = "1.0.0"
        dependencies = @("admin-system")
        metadata = @{
            description = "Subscriptions and payments"
            category = "enterprise"
        }
    },
    @{
        name = "analytics"
        version = "1.0.0"
        dependencies = @("admin-system")
        metadata = @{
            description = "Platform analytics and metrics"
            category = "enterprise"
        }
    },
    @{
        name = "email-system"
        version = "1.0.0"
        dependencies = @()
        metadata = @{
            description = "Email notifications and templates"
            category = "communication"
        }
    },
    @{
        name = "central-motherboard"
        version = "1.0.0"
        dependencies = @()
        metadata = @{
            description = "Central control system"
            category = "core"
        }
    },
    @{
        name = "self-improvement"
        version = "1.0.0"
        dependencies = @("central-motherboard")
        metadata = @{
            description = "Self-improving architecture engine"
            category = "ai"
        }
    }
)

Write-Host "Modules to register:" -ForegroundColor Yellow
foreach ($module in $modules) {
    Write-Host "  - $($module.name) v$($module.version)" -ForegroundColor White
}

Write-Host ""
Write-Host "To register these modules, use the API:" -ForegroundColor Yellow
Write-Host "  POST /api/motherboard/modules" -ForegroundColor Cyan
Write-Host ""
Write-Host "Or use the Super Admin dashboard once it's implemented." -ForegroundColor Yellow
Write-Host ""

