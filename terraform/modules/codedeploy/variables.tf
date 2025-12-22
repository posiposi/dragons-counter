variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "ec2_tag_value" {
  description = "EC2 instance Name tag value for deployment target"
  type        = string
}
